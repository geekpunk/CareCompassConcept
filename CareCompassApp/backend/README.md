# CareCompass Backend

The backend for CareCompass is a robust **Flask** application that serves as the secure bridge between the frontend, the database (Firebase Firestore), and the AI model (Google Gemini). It handles all sensitive operations, including data encryption/decryption and AI prompt engineering.

## 🛠️ Technology Stack

*   **Framework**: [Flask](https://flask.palletsprojects.com/) - Lightweight WSGI web application framework.
*   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) - NoSQL document database.
*   **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage) - For storing medical files (PDFs, Images).
*   **AI Model**: [Google Gemini 1.5 Pro](https://deepmind.google/technologies/gemini/) - Via `google-generativeai` SDK.
*   **Encryption**: `cryptography` (Fernet) - Symmetric encryption for securing patient data at rest.
*   **Server**: Gunicorn - For production deployment.

## 🔐 Security & Encryption

The backend implements a strict **Encryption at Rest** policy.
*   **Encryption Key**: A symmetric key (Fernet) is loaded from environment variables (`ENCRYPTION_KEY`).
*   **Process**:
    *   **Write**: Data received from the frontend is encrypted *before* being sent to Firestore.
    *   **Read**: Data fetched from Firestore is decrypted *before* being sent back to the frontend.
*   **Scope**: Patient details, medications, doctors, chat history, and file metadata are all encrypted.

## 📂 Directory Structure

```
backend/
├── app.py              # Main Flask application entry point. Defines API routes.
├── utils.py            # Utility classes for Config management and Encryption (CryptoManager).
├── prompts.py          # System prompts and templates for the Gemini AI.
├── Dockerfile          # Container definition for Cloud Run deployment.
├── requirements.txt    # Python dependencies.
├── check_buckets.py    # Utility script to verify Firebase Storage access.
├── generate_key.py     # Helper script to generate a new Fernet encryption key.
└── debug_key.py        # Helper to debug key loading issues.
```

## 🚀 API Endpoints

### Authentication
All endpoints require a valid Firebase ID Token in the `Authorization` header (`Bearer <token>`).

### Patient Management
*   `GET /api/patients`: List all patients for the authenticated user.
*   `POST /api/patients`: Create or update a patient profile.
*   `POST /api/patients/import`: Import a full patient history.

### Chat & AI
*   `POST /api/chat`: Send a message to the AI. Supports text and image inputs. Streams the response.
*   `GET /api/patients/<id>/chats`: Retrieve chat history.
*   `POST /api/patients/<id>/chats`: Save a chat session.

### File Handling
*   `POST /api/patients/<id>/files`: Upload a file.
*   `GET /api/patients/<id>/files`: List files.
*   `GET /api/files/<pid>/<fid>/download`: Get a signed URL for file download.
*   `DELETE /api/patients/<id>/files/<fid>`: Delete a file.

## 🔧 Setup & Running

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configuration**:
    Ensure you have the necessary secrets set in your environment or `config/secrets.yaml`:
    *   `GEMINI_API_KEY`
    *   `ENCRYPTION_KEY`
    *   `FIREBASE_SERVICE_ACCOUNT_JSON` (or path)

3.  **Run Locally**:
    ```bash
    python app.py
    ```
    The server will start on port `8080` (or as configured).
