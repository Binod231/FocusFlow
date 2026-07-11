# FocusFlow

> **AI-Powered Task Prioritizer** — AWS Weekend Productivity Challenge 2026

Stop guessing what to work on. Paste your to-do list → FocusFlow's AI engine scores every task by urgency & impact, builds your daily schedule, and tells you exactly what to tackle first.

![FocusFlow UI screenshot](docs/screenshot.png)

---

## ✨ Features

- **AI Priority Scoring** — Every task gets a 1–10 Urgency + Impact score powered by Amazon Bedrock Nova Lite
- **Daily Schedule Planner** — Tasks automatically bucketed into morning / afternoon / evening blocks
- **Per-Task Insights** — One-sentence AI coaching tip explaining *why* each task is ranked where it is
- **One-Click Export** — Copy your full prioritized plan to clipboard
- **Zero login required** — Works instantly, sessions stored in DynamoDB for 30 days

---

## 🏗 Architecture

```
Browser (Amplify Hosting)
    │
    ▼
API Gateway ──► Lambda (Python 3.12) ──► Amazon Bedrock Nova Lite
                      │
                      ▼
                 DynamoDB (task sessions, 30-day TTL)
```

### AWS Services Used

| Service | Purpose |
|---|---|
| **Amazon Bedrock (Nova Lite)** | AI task prioritization & scheduling |
| **AWS Lambda** | Serverless backend |
| **Amazon API Gateway** | REST API with CORS |
| **Amazon DynamoDB** | Session history storage |
| **AWS Amplify Hosting** | Static frontend deployment |
| **AWS SAM** | Infrastructure as code |

---

## 🚀 Deployment

### Prerequisites

```bash
# 1. Install AWS CLI and SAM CLI
# https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

# 2. Configure AWS credentials
aws configure

# 3. Enable Bedrock Nova Lite in your AWS console
# Console → Amazon Bedrock → Model access → amazon.nova-lite-v1:0 → Enable
```

### One-Command Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. ✅ Verify AWS CLI + SAM CLI are installed
2. ✅ Create an S3 bucket for SAM artifacts
3. ✅ Build and deploy the Lambda function
4. ✅ Set up API Gateway and DynamoDB
5. ✅ Automatically inject the live API URL into `frontend/app.js`
6. ✅ Deploy the frontend to Amplify Hosting

### Local Testing (Before Deploy)

```bash
cd backend
sam build
sam local invoke PrioritizeFunction --event test-event.json
```

### Manual Frontend Deploy

If the Amplify CLI step fails, drag-and-drop the `frontend/` folder at:
`https://console.aws.amazon.com/amplify/home`

---

## 📁 Project Structure

```
focusflow/
├── backend/
│   ├── lambda/
│   │   └── handler.py          # Lambda function (Bedrock + DynamoDB)
│   ├── template.yaml           # AWS SAM infrastructure
│   └── test-event.json         # Local test payload
├── frontend/
│   ├── index.html              # Single-page app
│   ├── styles.css              # Premium dark-mode UI
│   └── app.js                  # API integration + rendering
└── deploy.sh                   # Automated deployment
```

---

## 💰 AWS Free Tier Costs

This app is designed to run **entirely within AWS Free Tier**:

| Service | Free Tier Limit | Expected Usage |
|---|---|---|
| Lambda | 1M requests/month | ~100 requests/month |
| API Gateway | 1M calls/month | ~100 calls/month |
| DynamoDB | 25 GB + 25 WCU/RCU | Minimal |
| Amplify Hosting | 5 GB storage, 15 GB transfer | Minimal |
| Bedrock Nova Lite | ~$0.0003/1K input tokens | ~$0.01/month |

---

## 📄 Article

Read the full build story on AWS Builder Center:
[Weekend Productivity Challenge: FocusFlow — AI Task Prioritizer](#)

---

## License

MIT
