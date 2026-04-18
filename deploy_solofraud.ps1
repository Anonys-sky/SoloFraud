# SoloFraud Deployment Script
# This script automate the build and deployment process to Google Cloud Run.

$GCLOUD = "C:\Users\User\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
$PROJECT_ID = "solofraud-my-2030"
$SERVICE_NAME = "solofraud-app"
$REGION = "asia-southeast1"

Write-Host "--- 🚀 Starting SoloFraud Deployment to Google Cloud ---" -ForegroundColor Cyan

# 1. Ensure Project is Set
Write-Host "[1/3] Setting project to $PROJECT_ID..." -ForegroundColor Yellow
& $GCLOUD config set project $PROJECT_ID

# 2. Build the Container Image
Write-Host "[2/3] Building container image in the cloud..." -ForegroundColor Yellow
& $GCLOUD builds submit --tag "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# 3. Deploy to Cloud Run
Write-Host "[3/3] Deploying to Cloud Run..." -ForegroundColor Yellow
& $GCLOUD run deploy $SERVICE_NAME `
  --image "gcr.io/$PROJECT_ID/$SERVICE_NAME" `
  --platform managed `
  --region $REGION `
  --allow-unauthenticated

Write-Host "--- ✅ Deployment Complete! ---" -ForegroundColor Green
Write-Host "IMPORTANT: Remember to set your GEMINI_API_KEY in the Cloud Run console under 'Variables & Secrets'." -ForegroundColor DarkYellow

