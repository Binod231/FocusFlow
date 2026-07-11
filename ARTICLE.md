# Weekend Productivity Challenge: FocusFlow — AI-Powered Task Prioritizer

**Tag:** #productivity

---

## The Problem Nobody Talks About

Every developer, manager, and knowledge worker I know shares the same invisible tax on their day: **decision fatigue before you even start working.**

You open your laptop. You have 12 tabs, 3 Slack threads, a half-written PR, a calendar invite you haven't prepped for, and a client email sitting unopened since yesterday. Your to-do list is a flat, unsorted pile with no hierarchy, no urgency signal, and no guide on what actually moves the needle today.

So you pick the easiest thing first. Then you answer emails. Then it's 2 PM and the critical work still hasn't started.

FocusFlow was built to solve exactly this: **the gap between "I have a list of things to do" and "I know exactly what to work on right now."**

---

## What FocusFlow Does

FocusFlow is a zero-login AI productivity tool that turns your messy to-do list into a prioritized, scheduled daily plan in under two seconds.

Here's the full user flow:

1. **Brain-dump your tasks.** Open FocusFlow and type or paste your task list — one task per line. No formatting needed. Just dump everything on your mind. The app detects how many tasks you've typed and shows a live estimated work time.

2. **Hit "Prioritize with AI."** The frontend sends your raw task list to an AWS Lambda function via API Gateway. Lambda calls Amazon Bedrock Nova Lite with a carefully engineered system prompt.

3. **AI scores every task on two dimensions:**
   - **Urgency (1–10):** How time-sensitive is this? Does it block someone else? Is there a deadline today?
   - **Impact (1–10):** If you complete this, how much does it move the needle on outcomes that matter?
   - The final **Priority Score** is a weighted average: `urgency × 0.4 + impact × 0.6` — weighted toward impact, because most urgent things aren't the most important.

4. **You get back a structured plan** with:
   - Every task ranked by priority score with a visual score ring and urgency/impact bars
   - A category label per task (Deep Work, Admin, Comms, Creative, Routine)
   - An estimated time for each task in minutes
   - A one-sentence AI coaching insight explaining *why* that task ranks where it does
   - A complete daily schedule bucketed into Morning (9 AM–12 PM), Afternoon (12–5 PM), and Evening (5–9 PM) — with high-priority deep work automatically placed in the morning
   - A session summary and a personalized productivity coaching tip

5. **Mark tasks done** as you work through them. The completed tasks fade with a strikethrough. Your session is saved to localStorage and — on the backend — to DynamoDB for up to 30 days.

The whole round trip from hitting the button to seeing results takes about 2 seconds. There's no account to create, no subscription, no setup beyond opening the URL.

---

## How I Built It

### Starting Point: The Prompt Engineering

The most important work in this project wasn't the infrastructure — it was the system prompt for Bedrock Nova Lite.

I wanted the AI to return **deterministic, structured JSON** every single time, not prose. That meant crafting a system prompt that:
- Defined the exact JSON schema with every field and type
- Set precise rules for each field (urgency is 1–10, time_block must be one of four specific values)
- Gave the model a scoring formula to follow (`urgency × 0.4 + impact × 0.6`)
- Told it to sort the output by `priority_score` descending
- Instructed it to assign high-priority deep work to morning blocks

I set `temperature: 0.3` to keep outputs consistent and `topP: 0.9` for a bit of natural variation in the insight text. One defensive detail I had to add: even with explicit instructions, models sometimes wrap JSON in markdown code fences (```json ... ```). The Lambda handler strips those automatically if they appear.

Getting this prompt dialed in took a few iterations. The first version would occasionally swap urgency and impact values, or put admin tasks in the morning block. Adding explicit rules for each eliminated those inconsistencies.

### Backend: Lambda + Bedrock + DynamoDB

The backend is a single Python Lambda function (`handler.py`) built with Python 3.12. It does three things:

1. **Validates the incoming request** — checks for empty input, enforces a 5,000-character limit, and returns structured error messages with helpful guidance (including the exact steps to enable Bedrock model access if the account doesn't have it enabled yet).

2. **Calls Bedrock Nova Lite** using the `bedrock-runtime` client with the Converse-style API (`invoke_model`). The request wraps the user's task list in the prompt, passes the system instructions separately, and caps output at 2,048 tokens.

3. **Saves the session to DynamoDB** as a best-effort fire-and-forget — if the write fails, the API still returns the result. Each record includes a `session_id` (UUID), timestamp, task count, and raw tasks (capped at 2KB). A 30-day TTL attribute handles automatic cleanup without any cron jobs.

CORS is handled at the Lambda level with explicit response headers, and also configured at the API Gateway level in the SAM template.

### Infrastructure as Code with AWS SAM

The entire backend infrastructure is defined in a single `template.yaml` using AWS SAM. It provisions:
- The Lambda function with a 30-second timeout and 256MB memory
- An API Gateway REST API with CORS pre-configured
- A DynamoDB table (`FocusFlowSessions`) with on-demand billing and TTL enabled
- Least-privilege IAM policies — Lambda can only call `bedrock:InvokeModel` on the specific Nova Lite model ARN and `dynamodb:PutItem/GetItem` on its own table

The `deploy.sh` script wraps the entire deployment: checks prerequisites, creates an S3 artifact bucket if needed, runs `sam build` and `sam deploy`, captures the API URL from CloudFormation outputs, injects it into the frontend config, and deploys the frontend to Amplify Hosting.

### Frontend: React + Vite + CSS Modules

The frontend is a React app built with Vite, styled entirely with CSS Modules — no external UI library. The design philosophy was a dense, editorial dark theme with warm-tinted blacks rather than pure `#000000`, giving the UI depth and contrast without harshness.

Key frontend decisions:

- **Custom hooks for separation of concerns.** `usePrioritize` owns all API state (loading, error, result). `useStreak` tracks consecutive daily visits in localStorage. `useHistory` reads the last 7 sessions. This keeps every component purely presentational.

- **The ScoreRing SVG component** renders the priority score as an animated circular progress ring. The ring fills based on the score percentage, with a glow effect color-coded to the score level (green for low, amber for medium, rose for high priority). Each card also shows **Difficulty Dots** — three small colored circles that instantly communicate Easy, Medium, or Hard at a glance, driven by the same score thresholds.

- **The StatsBar component** gives an at-a-glance session summary: total tasks, estimated work time, average score, high-priority count, and top task category.

- **Tabbed Results view** with three panels: Priority List (the ranked card list), Daily Schedule (a 3-column grid per time block), and Insights (a category breakdown bar chart, top-5 score distribution, and coaching tip).

- **Expandable task cards** — every card shows a collapsed summary; clicking the chevron reveals the full AI insight in an indigo-bordered panel without navigating away.

The biggest UX challenge was the loading state. A 2-second API call feels long if nothing is happening. I solved this with a spinner that shows "Analyzing your tasks… Amazon Bedrock Nova Lite is thinking" — naming the model specifically makes it feel like real intelligence is working, not a generic spinner.

---

## AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                          │
│              (React App via AWS Amplify Hosting)             │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTPS POST /prioritize
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               Amazon API Gateway (REST)                      │
│        POST /prioritize  +  OPTIONS (CORS preflight)         │
└───────────────────────────┬─────────────────────────────────┘
                            │  Invoke
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            AWS Lambda  (Python 3.12, 256MB, 30s)             │
│                                                              │
│   1. Parse & validate input                                  │
│   2. Call Bedrock Nova Lite → get structured JSON            │
│   3. Write session record to DynamoDB (best-effort)          │
│   4. Return prioritized plan                                 │
└──────────────┬────────────────────────┬─────────────────────┘
               │  InvokeModel           │  PutItem
               ▼                        ▼
┌──────────────────────┐   ┌────────────────────────────────┐
│  Amazon Bedrock      │   │  Amazon DynamoDB               │
│  Nova Lite v1        │   │  FocusFlowSessions             │
│  (amazon.nova-       │   │  PK: session_id (UUID)         │
│   lite-v1:0)         │   │  TTL: 30 days auto-expiry      │
└──────────────────────┘   └────────────────────────────────┘
```

### Services Used

| Service | Role |
|---|---|
| **Amazon Bedrock (Nova Lite)** | Core AI — task scoring, categorization, scheduling, and coaching tips |
| **AWS Lambda** | Serverless compute — Python function that orchestrates the entire backend |
| **Amazon API Gateway** | REST endpoint with CORS, routing POST and OPTIONS methods |
| **Amazon DynamoDB** | Session persistence with on-demand pricing and 30-day TTL auto-cleanup |
| **AWS Amplify Hosting** | Zero-config static frontend deployment with global CDN |
| **AWS SAM** | Infrastructure as code — single `template.yaml` defines everything |

All of this runs **within AWS Free Tier** for typical personal usage. The only real cost is Bedrock Nova Lite at approximately $0.0003 per 1,000 input tokens — a standard 10-task list uses roughly 500 tokens, meaning you could make thousands of requests for less than a dollar.

---

## What I Learned

**1. Bedrock Nova Lite is remarkably capable for structured output tasks.**
I was surprised by how reliably it follows a strict JSON schema when the system prompt is explicit about field names, types, and rules. The key was being prescriptive — not just "return JSON" but "return this exact structure with these exact field names and these constraints." At temperature 0.3 it's highly consistent.

**2. SAM makes serverless infrastructure genuinely approachable.**
Before this challenge I'd used the console for most Lambda work. Writing everything in `template.yaml` and deploying with `sam deploy` was a significant workflow upgrade — the entire backend is reproducible from a single command. The fact that SAM handles IAM policy generation for common patterns (like `bedrock:InvokeModel`) eliminates a whole class of boilerplate.

**3. DynamoDB's TTL feature is underrated.**
Setting a `ttl` attribute at record creation and enabling TTL on the table means old session data automatically expires with zero operational work — no Lambda cron, no batch delete, no cost for storing old records beyond the threshold. For a tool where you only need recent history, this is a perfect fit.

**4. React custom hooks are the right abstraction for API state.**
Lifting all fetch logic into `usePrioritize` meant every component received clean props and stayed focused on rendering. When I needed to add history tracking, I added `useHistory` independently without touching any component. The pattern scaled well.

**5. Prompt engineering is real engineering.**
Getting the AI to return the exact schema I wanted — with consistent field values, correct sort order, and appropriate time block assignments — required iteration and testing, just like writing a function. The `temperature` and `topP` settings matter. Treating the system prompt as production code (explicit rules, no ambiguity) made the difference between an unreliable prototype and a consistent product.

---

## Live App & Source Code

- **Live App:** [https://main.d2dgdbrgwxrtoy.amplifyapp.com](https://main.d2dgdbrgwxrtoy.amplifyapp.com)
- **GitHub Repository:** [https://github.com/Binod231/FocusFlow](https://github.com/Binod231/FocusFlow)

The full source — Lambda handler, SAM template, React frontend, CSS modules, and deployment script — is in the repo. If you want to run it yourself, enable Amazon Bedrock Nova Lite in your AWS account, run `./deploy.sh`, and you'll have your own instance live in under five minutes.

---

## Final Thoughts

The weekend challenge format is a surprisingly effective constraint. Knowing you have 72 hours forces you to make real decisions instead of bikeshedding — you pick the architecture that works, you write the code, you ship it. No perfect design document required.

FocusFlow solved a problem I have every single morning. The fact that it now runs on serverless AWS infrastructure at effectively zero cost, returns AI-generated plans in two seconds, and required no database schema design, no server management, and no capacity planning — that's the actual pitch for building this way.

If you're sitting on a list of tasks wondering what to work on first, try it. Let the AI do that cognitive labor so you can spend your energy on the work itself.

---

*Built for the AWS Weekend Productivity Challenge · July 2026*
*Stack: Amazon Bedrock Nova Lite · AWS Lambda · Amazon API Gateway · Amazon DynamoDB · AWS Amplify · AWS SAM*
