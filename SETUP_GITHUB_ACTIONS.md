# Setting up GitHub Actions Deployment

To enable the automated deployment workflow, you need to add two secrets to your GitHub repository.

## 1. GCP_SA_KEY

This is the Service Account Key for Google Cloud.

1.  Go to the **Google Cloud Console** > **IAM & Admin** > **Service Accounts**.
2.  Create a new Service Account (e.g., `github-actions-deployer`).
3.  Grant the following roles to this service account:
    *   **Cloud Build Editor**
    *   **Cloud Run Admin**
    *   **Artifact Registry Writer**
    *   **Service Account User**
    *   **Firebase Admin** (or specifically Firebase Hosting Admin)
    *   **Viewer** (Required to stream build logs)
    *   **Logs Viewer** (Required to stream build logs needed by github actions to know when the build is done)
    *   **API Keys Viewer** (optional, but helpful)
4.  Click on the newly created service account > **Keys** tab.
5.  Click **Add Key** > **Create new key** > **JSON**.
6.  A JSON file will download to your computer.
7.  Open this file, copy the entire content.
8.  Go to your **GitHub Repository** > **Settings** > **Secrets and variables** > **Actions**.
9.  Click **New repository secret**.
10. Name: `GCP_SA_KEY`
11. Value: Paste the JSON content.
12. Click **Add secret**.

## 2. FIREBASE_TOKEN

This is required for the `firebase deploy` command.

1.  Open your terminal.
2.  Run: `firebase login:ci`
3.  Log in with your Google account.
4.  Copy the token printed in the terminal (it starts with `1//...`).
5.  Go to your **GitHub Repository** > **Settings** > **Secrets and variables** > **Actions**.
6.  Click **New repository secret**.
7.  Name: `FIREBASE_TOKEN`
8.  Value: Paste the token.
9.  Click **Add secret**.

## 3. Application Secrets
The application requires the following secrets to function correctly. Add these to your GitHub Repository Secrets as well.

### GEMINI_API_KEY
1.  Get your API key from Google AI Studio.
2.  Add secret `GEMINI_API_KEY` with the value.

### ENCRYPTION_KEY
1.  This is used for encrypting patient data.
2.  You can generate one locally using python:
    ```python
    from cryptography.fernet import Fernet
    print(Fernet.generate_key().decode())
    ```
3.  Add secret `ENCRYPTION_KEY` with the value.

### FIREBASE_SERVICE_ACCOUNT_JSON
1.  This allows the backend to authenticate with Firebase without needing a file on disk.
2.  Use the same JSON content you downloaded for `GCP_SA_KEY` (or a separate service account if you prefer).
3.  Add secret `FIREBASE_SERVICE_ACCOUNT_JSON` with the JSON content.

## Triggering the Deployment

The deployment will automatically run whenever you push code to the `main` branch.
You can also manually trigger it from the **Actions** tab in your GitHub repository.

## Troubleshooting

### Error: "The tool can only stream logs if you are Viewer/Owner"
If you see this error during the `gcloud builds submit` step, it means your Service Account is missing the **Viewer** role.

To fix this:
1.  Go to **Google Cloud Console** > **IAM & Admin** > **IAM**.
2.  Find your service account (e.g., `github-actions-deployer`).
3.  Click the **Edit** (pencil icon) button.
4.  Click **+ ADD ANOTHER ROLE**.
5.  Select **Basic** > **Viewer**.
6.  Click **Save**.
7.  Re-run the GitHub Action.
