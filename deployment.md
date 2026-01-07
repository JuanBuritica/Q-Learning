
# Deployment Guide: Google Cloud Run

This guide will help you deploy the Q-Learning Maze Solver to Google Cloud Run.

## Prerequisites
1. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and initialized.
2. A Google Cloud Project.

## Steps

### 1. Build the Container Image
Run the following command in the project root (replace `PROJECT-ID` with your Google Cloud Project ID):

```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/q-learning-maze
```

### 2. Deploy to Cloud Run
Run the deploy command:

```bash
gcloud run deploy q-learning-maze \
  --image gcr.io/PROJECT-ID/q-learning-maze \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 3. Access your App
Cloud Run will output a Service URL (e.g., `https://q-learning-maze-xxxxx-uc.a.run.app`). 
Open that URL in your browser to use the application.

## GitHub Hosting
1. Initialize git: `git init`
2. Add files: `git add .`
3. Commit: `git commit -m "Initial commit"`
4. Create a repo on GitHub.
5. Push: `git push -u origin main`
