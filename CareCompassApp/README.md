# CareCompass

## Setup Instructions

### Prerequisites
*   **Python 3.8+**
*   **Node.js 16+**
*   **Firebase Project**: You need a Firebase project with:
    *   **Authentication** (Google Sign-In enabled)
    *   **Firestore Database** (Create a database in production mode)
    *   **Storage** (Create a default bucket)
*   **Google Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/).

### 1. Configuration
The application relies on a configuration directory `CareCompassApp/config/`.

1.  **Firebase Service Account**:
    *   Go to Firebase Console -> Project Settings -> Service Accounts.
    *   Generate a new private key.
    *   Save the file as `CareCompassApp/config/firebaseConfig.json`.

2.  **Secrets Configuration**:
    *   Create a new file `CareCompassApp/config/secrets.yaml`. See 
    *   Update the following fields:
        ```yaml
        gemini_api_key: "YOUR_GEMINI_API_KEY"
        firebase_service_account_path: "config/firebaseConfig.json"
        encryption_key: "YOUR_GENERATED_KEY" 
        ```
    *   *Note*: To generate a valid encryption key, run:
        ```bash
        python3 backend/generate_key.py
        ```
        Copy the output and paste it into `secrets.yaml`.

3.  **Frontend Firebase Config**:
    *   Update `CareCompassApp/frontend/src/firebase.js` with your Firebase Web App configuration (API Key, Auth Domain, etc.) found in Project Settings.

### 2. Backend Setup
The backend is a Flask application that handles encryption, database interactions, and AI orchestration.

```bash
cd CareCompassApp/backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python3 app.py
```
*The backend runs on `http://localhost:5000`.*

### 3. Frontend Setup
The frontend is a modern React application built with Vite and Tailwind CSS.

```bash
cd CareCompassApp/frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*The frontend runs on `http://localhost:5173`.*

---
## currently set up to run with github actions
see SETUP_GITHUB_ACTIONS.md for instructions

## Troubleshooting

*   **"Bucket not found" error**: Ensure you have enabled "Storage" in your Firebase Console and that the bucket name in `backend/app.py` matches your Firebase Storage bucket URL (usually `project-id.firebasestorage.app`).
*   **Data not saving**: Check the backend logs. If you see `>> SAVING TO MEMORY`, it means the backend couldn't find or validate your `firebaseConfig.json`. Ensure the path in `secrets.yaml` is correct.
