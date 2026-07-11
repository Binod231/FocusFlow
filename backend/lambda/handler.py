"""
FocusFlow — AI Task Prioritizer
Lambda handler: calls Amazon Bedrock Nova Lite and stores results in DynamoDB.
"""

import json
import os
import uuid
import boto3
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
bedrock = boto3.client("bedrock-runtime", region_name=os.environ.get("AWS_REGION", "us-east-1"))
dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1"))
table = dynamodb.Table(os.environ.get("TABLE_NAME", "FocusFlowSessions"))

# ---------------------------------------------------------------------------
# Bedrock model
# ---------------------------------------------------------------------------
MODEL_ID = "amazon.nova-lite-v1:0"

SYSTEM_PROMPT = """You are FocusFlow, an expert productivity coach and task prioritization engine.
Analyze the user's task list and return a structured JSON response ONLY — no prose, no markdown fences.

Return this exact JSON structure:
{
  "session_summary": "A single sentence describing today's workload",
  "tasks": [
    {
      "id": 1,
      "title": "Original task title (cleaned up)",
      "urgency": 8,
      "impact": 9,
      "priority_score": 8.5,
      "estimated_minutes": 45,
      "time_block": "morning",
      "ai_insight": "One sentence explaining why this is ranked here and a quick tip",
      "category": "deep_work"
    }
  ],
  "schedule": {
    "morning": ["task id list"],
    "afternoon": ["task id list"],
    "evening": ["task id list"]
  },
  "coaching_tip": "One actionable productivity tip for today's specific workload"
}

Rules:
- urgency: 1-10 (how time-sensitive is this)
- impact: 1-10 (how much does this move the needle)
- priority_score: weighted average (urgency * 0.4 + impact * 0.6), rounded to 1 decimal
- Sort tasks array by priority_score descending
- time_block: "morning" | "afternoon" | "evening" | "anytime"
- category: "deep_work" | "admin" | "communication" | "creative" | "routine"
- estimated_minutes: realistic estimate in minutes
- schedule arrays contain task id integers
- Assign high-priority deep work to morning, lighter tasks to afternoon/evening
"""


def build_prompt(raw_tasks: str) -> str:
    return f"""Here is my task list for today:

{raw_tasks}

Analyze these tasks and return the prioritized JSON response."""


# ---------------------------------------------------------------------------
# DynamoDB helpers
# ---------------------------------------------------------------------------
def save_session(session_id: str, raw_tasks: str, result: dict) -> None:
    try:
        table.put_item(
            Item={
                "session_id": session_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "raw_tasks": raw_tasks[:2000],  # cap at 2 KB
                "task_count": len(result.get("tasks", [])),
                "ttl": int(datetime.now(timezone.utc).timestamp()) + 60 * 60 * 24 * 30,  # 30-day TTL
            }
        )
    except Exception as e:
        print(f"[WARN] DynamoDB save failed (non-fatal): {e}")


# ---------------------------------------------------------------------------
# CORS headers
# ---------------------------------------------------------------------------
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
}


def respond(status: int, body: dict) -> dict:
    return {
        "statusCode": status,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


# ---------------------------------------------------------------------------
# Lambda entry point
# ---------------------------------------------------------------------------
def lambda_handler(event: dict, context) -> dict:
    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return respond(200, {"message": "ok"})

    # Parse body
    try:
        body = json.loads(event.get("body") or "{}")
        raw_tasks = body.get("tasks", "").strip()
    except json.JSONDecodeError:
        return respond(400, {"error": "Invalid JSON body"})

    if not raw_tasks:
        return respond(400, {"error": "No tasks provided. Please add at least one task."})

    if len(raw_tasks) > 5000:
        return respond(400, {"error": "Task list too long. Please keep it under 5000 characters."})

    # Call Bedrock Nova Lite
    try:
        messages = [{"role": "user", "content": [{"text": build_prompt(raw_tasks)}]}]
        native_request = {
            "messages": messages,
            "system": [{"text": SYSTEM_PROMPT}],
            "inferenceConfig": {
                "maxTokens": 2048,
                "temperature": 0.3,
                "topP": 0.9,
            },
        }

        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps(native_request),
            contentType="application/json",
            accept="application/json",
        )

        raw_response = json.loads(response["body"].read())
        output_text = raw_response["output"]["message"]["content"][0]["text"].strip()

        # Strip markdown fences if model added them anyway
        if output_text.startswith("```"):
            lines = output_text.split("\n")
            output_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        result = json.loads(output_text)

    except json.JSONDecodeError as e:
        print(f"[ERROR] Bedrock returned non-JSON: {output_text[:500]}")
        return respond(502, {"error": "AI returned an unexpected format. Please try again."})
    except bedrock.exceptions.ModelNotReadyException:
        return respond(503, {"error": "Bedrock model is warming up. Please try again in a moment."})
    except Exception as e:
        err_str = str(e)
        print(f"[ERROR] Bedrock call failed: {err_str}")
        if "not allowed for this account" in err_str or "ValidationException" in err_str:
            return respond(403, {
                "error": "Bedrock Nova Lite access not enabled on this AWS account. "
                         "Go to: AWS Console → Amazon Bedrock → Model access → "
                         "enable 'Amazon Nova Lite' → Save changes (takes ~60s)."
            })
        return respond(502, {"error": f"AI service error: {err_str}"})

    # Save session to DynamoDB (best-effort)
    session_id = str(uuid.uuid4())
    save_session(session_id, raw_tasks, result)

    # Return result
    result["session_id"] = session_id
    return respond(200, result)
