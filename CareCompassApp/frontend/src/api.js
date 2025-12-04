import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken(); // Get Firebase token
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    return { 'Content-Type': 'application/json' };
};

export const callChatAPI = async (prompt, imageBase64, context, history, signal, mimeType = 'image/jpeg', fileId = null, patientId = null, onUpdate = null) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ prompt, image: imageBase64, mimeType, context, history, fileId, patientId }),
            signal: signal
        });

        if (!response.ok) throw new Error('API Error');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            if (onUpdate) onUpdate(fullText);
        }

        return fullText;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Request aborted');
            return null; // Indicate abort
        }
        console.error(error);
        return "I'm having trouble connecting to the service.";
    }
};

export const getPatients = async () => {
    try {
        console.log("API: getPatients called");
        const headers = await getAuthHeaders();
        console.log("API: Fetching from", `${API_BASE_URL}/patients`);
        const response = await fetch(`${API_BASE_URL}/patients`, {
            headers: headers
        });
        console.log("API: getPatients response status:", response.status);
        if (!response.ok) {
            const text = await response.text();
            console.error("API: Failed to fetch patients:", response.status, text);
            throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        console.log("API: getPatients data:", data);
        return data;
    } catch (error) {
        console.error("API: getPatients error:", error);
        return [];
    }
};

export const savePatient = async (patient) => {
    try {
        console.log("API: savePatient called");
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(patient)
        });
        console.log("API: savePatient response status:", response.status);
        if (!response.ok) {
            const text = await response.text();
            console.error("API: Failed to save patient:", response.status, text);
            throw new Error('Failed to save patient');
        }
        const data = await response.json();
        console.log("API: savePatient success:", data);
        return data;
    } catch (error) {
        console.error("API: savePatient error:", error);
        throw error;
    }
};

export const getPatientChats = async (patientId) => {
    try {
        console.log("API: getPatientChats called for", patientId);
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/chats`, {
            headers: headers
        });
        console.log("API: getPatientChats response status:", response.status);
        if (!response.ok) {
            const text = await response.text();
            console.error("API: Failed to fetch chats:", response.status, text);
            throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        console.log("API: getPatientChats data length:", data.length);
        return data;
    } catch (error) {
        console.error("API: getPatientChats error:", error);
        return [];
    }
};

export const savePatientChat = async (patientId, chatData) => {
    try {
        console.log("API: savePatientChat called for", patientId);
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/chats`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(chatData)
        });
        console.log("API: savePatientChat response status:", response.status);
        if (!response.ok) {
            const text = await response.text();
            console.error("API: Failed to save chat:", response.status, text);
            throw new Error('Failed to save chat');
        }
        const data = await response.json();
        console.log("API: savePatientChat success:", data);
        return data;
    } catch (error) {
        console.error("API: savePatientChat error:", error);
        throw error;
    }
};

export const exportPatient = async (patientId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/export`, {
            headers: headers
        });
        if (!response.ok) throw new Error('Failed to export patient');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const importPatient = async (data) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients/import`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to import patient');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const uploadFile = async (patientId, file) => {
    try {
        const headers = await getAuthHeaders();
        // Remove Content-Type to let browser set multipart/form-data boundary
        delete headers['Content-Type'];

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/files`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload file');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getFiles = async (patientId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/files`, {
            headers: headers
        });
        if (!response.ok) throw new Error('Failed to fetch files');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getFileDownloadUrl = async (patientId, fileId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/files/${patientId}/${fileId}/download`, {
            headers: headers
        });
        if (!response.ok) throw new Error('Failed to get download URL');
        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
export const deleteFile = async (patientId, fileId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}/files/${fileId}`, {
            method: 'DELETE',
            headers: headers
        });
        if (!response.ok) throw new Error('Failed to delete file');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
