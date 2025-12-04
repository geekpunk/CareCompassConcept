# CareCompass Frontend

The frontend for CareCompass is a modern Single Page Application (SPA) built with **React** and **Vite**. It provides a responsive, secure, and interactive interface for users to manage health data and interact with the AI assistant.

## 🛠️ Technology Stack

*   **Framework**: [React](https://react.dev/) (v18+)
*   **Build Tool**: [Vite](https://vitejs.dev/) - For fast development and optimized builds.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
*   **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) - Handles Google Sign-In and user session management.
*   **Icons**: [Lucide React](https://lucide.dev/) - Beautiful & consistent icons.
*   **Markdown**: `react-markdown` - For rendering AI responses.

## 🚀 Key Features

*   **Dynamic Chat Interface**: Real-time chat with the AI assistant, supporting markdown rendering and file attachments.
*   **Patient Profile Management**: Comprehensive forms for managing patient details, conditions, medications, and doctors.
*   **Secure File Handling**: Interface for uploading, viewing, and managing encrypted medical documents.
*   **Responsive Design**: Fully responsive layout that works on desktop and mobile devices.
*   **Dark/Light Mode**: (Implicit support via Tailwind if configured, or just modern UI design).

## 📂 Directory Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and global styles
│   ├── components/         # Reusable UI Components
│   │   ├── ChatInterface.jsx       # Main chat window with AI
│   │   ├── ChatMessage.jsx         # Individual chat bubble component
│   │   ├── DocsMedsSection.jsx     # Management for Doctors & Medications
│   │   ├── FilesView.jsx           # File upload and list interface
│   │   ├── HomeDashboard.jsx       # Main landing dashboard
│   │   ├── Login.jsx               # Google Sign-In component
│   │   ├── Navigation.jsx          # App navigation bar
│   │   ├── ProfileSection.jsx      # Patient profile details view
│   │   └── ... (modals and widgets)
│   ├── api.js              # API client for communicating with the Flask backend
│   ├── firebase.js         # Firebase configuration and auth helpers
│   ├── App.jsx             # Main application layout and state manager
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles and Tailwind directives
├── index.html              # HTML entry point
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite configuration
```

## 🔧 Setup & Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Ensure you have the backend running on port `8080`.
    The frontend proxies API requests to `http://127.0.0.1:8080` (configured in `vite.config.js`).

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

4.  **Build for Production**:
    ```bash
    npm run build
    ```
    Output will be in the `dist/` directory.
