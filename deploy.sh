#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# FocusFlow — One-Command Deployment Script
# Usage: ./deploy.sh [--region us-east-1] [--stage prod]
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────
REGION="${AWS_REGION:-us-east-1}"
STAGE="prod"
STACK_NAME="focusflow"
S3_BUCKET_PREFIX="focusflow-sam-artifacts"

while [[ $# -gt 0 ]]; do
  case $1 in
    --region) REGION="$2"; shift 2;;
    --stage)  STAGE="$2";  shift 2;;
    *) echo "Unknown argument: $1"; exit 1;;
  esac
done

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   FocusFlow — Deployment Script      ║"
echo "║   Stack: ${STACK_NAME} | Stage: ${STAGE}     ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Prerequisite checks ───────────────────────────────────────
command -v aws  >/dev/null || { echo "❌ aws CLI not found. Install: https://aws.amazon.com/cli/"; exit 1; }
command -v sam  >/dev/null || { echo "❌ AWS SAM CLI not found. Install: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"; exit 1; }

echo "✅ Prerequisites found"

# ── Confirm AWS identity ───────────────────────────────────────
echo ""
echo "🔐 AWS Identity:"
aws sts get-caller-identity --query '{Account:Account,Arn:Arn}' --output table

echo ""
read -p "Proceed with deployment to ${REGION}? [y/N] " confirm
[[ "$confirm" =~ ^[yY] ]] || { echo "Aborted."; exit 0; }

# ── Create S3 bucket for SAM artifacts ────────────────────────
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
S3_BUCKET="${S3_BUCKET_PREFIX}-${ACCOUNT_ID}-${REGION}"

echo ""
echo "📦 Ensuring SAM artifact bucket: ${S3_BUCKET}"
aws s3api head-bucket --bucket "${S3_BUCKET}" 2>/dev/null || \
  aws s3api create-bucket \
    --bucket "${S3_BUCKET}" \
    --region "${REGION}" \
    $( [[ "${REGION}" != "us-east-1" ]] && echo "--create-bucket-configuration LocationConstraint=${REGION}" ) \
    --no-cli-pager

# ── SAM Build ─────────────────────────────────────────────────
echo ""
echo "🔨 Building Lambda function..."
cd "$(dirname "$0")/backend"
sam build --region "${REGION}"

# ── SAM Deploy ────────────────────────────────────────────────
echo ""
echo "🚀 Deploying to AWS..."
sam deploy \
  --stack-name "${STACK_NAME}" \
  --s3-bucket "${S3_BUCKET}" \
  --region "${REGION}" \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Stage="${STAGE}" \
  --no-fail-on-empty-changeset \
  --no-cli-pager

# ── Capture API URL ───────────────────────────────────────────
echo ""
echo "📡 Fetching API URL..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

echo ""
echo "✅ Backend deployed!"
echo "   API URL: ${API_URL}"

# ── Update frontend config ─────────────────────────────────────
FRONTEND_JS="$(dirname "$0")/frontend/app.js"
if [[ -f "${FRONTEND_JS}" ]]; then
  echo ""
  echo "🔧 Updating API_URL in frontend/app.js..."
  sed -i "s|YOUR_API_GATEWAY_URL_HERE|${API_URL}|g" "${FRONTEND_JS}"
  echo "   ✅ app.js updated with live API URL"
fi

# ── Deploy frontend to Amplify Hosting ────────────────────────
echo ""
echo "🌐 Deploying frontend to Amplify Hosting..."

APP_NAME="focusflow"
FRONTEND_DIR="$(dirname "$0")/frontend"

# Check if Amplify app already exists
AMPLIFY_APP_ID=$(aws amplify list-apps \
  --region "${REGION}" \
  --query "apps[?name=='${APP_NAME}'].appId" \
  --output text 2>/dev/null || echo "")

if [[ -z "${AMPLIFY_APP_ID}" ]]; then
  echo "   Creating new Amplify app..."
  AMPLIFY_APP_ID=$(aws amplify create-app \
    --name "${APP_NAME}" \
    --region "${REGION}" \
    --platform WEB \
    --query 'app.appId' \
    --output text)

  aws amplify create-branch \
    --app-id "${AMPLIFY_APP_ID}" \
    --branch-name main \
    --region "${REGION}" \
    --no-cli-pager >/dev/null
fi

echo "   Amplify App ID: ${AMPLIFY_APP_ID}"

# Zip frontend and deploy
TMPZIP="/tmp/focusflow-frontend.zip"
cd "${FRONTEND_DIR}"
zip -r "${TMPZIP}" . -x "*.DS_Store"

aws amplify start-deployment \
  --app-id "${AMPLIFY_APP_ID}" \
  --branch-name main \
  --region "${REGION}" \
  --source-url "file://${TMPZIP}" \
  --no-cli-pager >/dev/null 2>&1 || echo "   (Manual Amplify deploy — see note below)"

AMPLIFY_URL="https://main.${AMPLIFY_APP_ID}.amplifyapp.com"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              🎉 FocusFlow Deployed!                      ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Frontend:  ${AMPLIFY_URL}"
echo "║  API:       ${API_URL}"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next steps:"
echo "   1. Open ${AMPLIFY_URL} in your browser"
echo "   2. Test with a real task list"
echo "   3. Screenshot for your article!"
echo ""
echo "💡 Amplify note: If manual deploy is needed, go to:"
echo "   https://console.aws.amazon.com/amplify/home"
echo "   and drag-drop the frontend/ folder."
