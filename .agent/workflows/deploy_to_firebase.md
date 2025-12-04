---
description: Deploy CareCompass to Firebase Hosting and Cloud Run
---

# Deploy to Firebase

This workflow guides you through deploying the Frontend to Firebase Hosting and the Backend to Google Cloud Run.

## Prerequisites

1.  **Google Cloud Project**: You must have a Google Cloud Project with Firebase enabled.
2.  **Billing Enabled**: Cloud Run requires billing to be enabled.
3.  **Tools Installed**:
    *   `firebase-tools` (CLI)
    *   `gcloud` (Google Cloud CLI)

## Step 1: Login and Initialize

Ensure you are logged in to both tools.

```bash
firebase login
gcloud auth login
gcloud config set project carecompass-76a6a
```

## Step 2: Build the Frontend

We need to build the React application for production.

```bash
cd frontend
npm install
npm run build
cd ..
```

## Step 3: Deploy Backend to Cloud Run

We will deploy the Python backend as a containerized service on Cloud Run.
Run this from the `CareCompassApp` root directory.

Replace `<YOUR_PROJECT_ID>` with your actual project ID.

1.  **Submit Build**:
    ```bash
    gcloud builds submit --config cloudbuild.yaml .
    ```

2.  **Deploy Service**:
    ```bash
    gcloud run deploy carecompass-backend \
      --image us-central1-docker.pkg.dev/carecompass-76a6a/carecompass-repo/carecompass-backend \
      --region us-central1 \
      --allow-unauthenticated
    ```

    *Note: We allow unauthenticated access at the network level because our app handles authentication internally using Firebase Admin SDK.*

## Step 4: Deploy Frontend to Firebase Hosting

Now we deploy the static files and configure the rewrite rules to point `/api` to our Cloud Run service.

```bash
firebase deploy --only hosting
```

## Step 5: Verify

Visit the Hosting URL provided by the Firebase CLI output.
1.  Log in with Google.
2.  Test the Chat feature to ensure the backend is reachable (it should proxy `/api/chat` to Cloud Run).

## Troubleshooting

*   **CORS Errors**: If you see CORS errors, ensure your `firebase.json` rewrites are working. Direct calls to the Cloud Run URL might fail if the Origin header doesn't match what `flask-cors` expects, but via Firebase Hosting it should be fine.
*   **500 Errors**: Check Cloud Run logs in the Google Cloud Console.
*   **Missing Config**: Ensure `config/secrets.yaml` and `config/settings.yaml` were included in the build (the Dockerfile handles this).
