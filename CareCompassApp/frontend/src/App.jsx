import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import OnboardingModal from './components/OnboardingModal';
import HomeDashboard from './components/HomeDashboard';
import ChatInterface from './components/ChatInterface';
import HistoryList from './components/HistoryList';
import DocsMedsSection from './components/DocsMedsSection';
import ProfileSection from './components/ProfileSection';
import FilesView from './components/FilesView';
import PatientFormModal from './components/PatientFormModal';
import DebugInfoModal from './components/DebugInfoModal';
import Login from './components/Login';
import InitialSetupForm from './components/InitialSetupForm';
import { callChatAPI, getPatients, savePatient, getPatientChats, savePatientChat } from './api';
import { Loader2 } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [homeView, setHomeView] = useState('dashboard');
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPatientFormModal, setShowPatientFormModal] = useState(false);
  const [editingPatientData, setEditingPatientData] = useState(null);
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('hasSeenOnboarding');
  });

  const messagesEndRef = useRef(null);

  // Initial State Data
  const initialMessages = [
    {
      id: 1,
      sender: 'ai',
      text: "Hello. I'm CareCompass. I can help answer questions about your health, explain medical notes, or track your wellness.\n\nHow are you feeling today?"
    }
  ];

  const [patients, setPatients] = useState([]);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser ? "User logged in" : "No user");
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Load patients from backend
    const load = async () => {
      console.log("Fetching patients for user:", user.uid);
      try {
        const data = await getPatients();
        console.log("Patients fetched:", data);
        if (data && data.length > 0) {
          setPatients(data);
          setCurrentPatientId(data[0].id);
        } else {
          console.log("No patients found, triggering setup");
          // No patients found, trigger initial setup
          setShowInitialSetup(true);
          setShowOnboarding(false); // Defer onboarding until setup is done
        }
      } catch (err) {
        console.error("Error loading patients:", err);
      }
    };
    load();
  }, [user]);

  // Load chats when patient changes
  useEffect(() => {
    if (currentPatientId && user) {
      const loadChats = async () => {
        const patientChats = await getPatientChats(currentPatientId);
        setChats(patientChats);
      };
      loadChats();
    }
  }, [currentPatientId, user]);

  // Helper to get active patient object
  const activePatient = patients.find(p => p.id === currentPatientId) || patients[0];

  // Helper to get active chat
  const activeChat = chats.find(c => c.id === activeChatId) || { messages: [] };

  // Helper to update active patient
  const updateActivePatient = async (updates) => {
    if (!activePatient) return;

    const updatedPatient = { ...activePatient, ...updates };

    // Optimistic update
    setPatients(prev => prev.map(p =>
      p.id === currentPatientId ? updatedPatient : p
    ));

    // Save to backend
    await savePatient(updatedPatient);
  };

  const handleInitialSetupSave = async (data) => {
    try {
      console.log("Starting initial setup save...", data);
      const newId = Date.now().toString();
      const newPatient = {
        id: newId,
        name: data.name,
        dob: data.dob,
        insuranceProvider: data.insuranceProvider,
        insuranceId: data.insuranceId,
        groupId: data.groupId,
        height: data.height,
        weight: data.weight,
        bloodPressure: data.bloodPressure,
        heartRate: data.heartRate,
        otherVitals: data.otherVitals,
        conditions: [],
        age: '', // Could calculate from DOB
        medications: '',
        doctors: [],
        medicationsList: [],
        lastUpdate: null
      };

      console.log("Saving patient to backend:", newPatient);
      await savePatient(newPatient);
      console.log("Patient saved successfully. Updating state...");

      setPatients([newPatient]);
      setCurrentPatientId(newId);
      setShowInitialSetup(false);
      setShowOnboarding(true); // Show onboarding now
    } catch (error) {
      console.error("Error in handleInitialSetupSave:", error);
      throw error; // Re-throw so the form can handle it
    }
  };

  const handleAddPatient = async (data) => {
    const newId = Date.now().toString();
    const newPatient = {
      id: newId,
      name: data.name,
      dob: data.dob,
      insuranceProvider: data.insuranceProvider,
      insuranceId: data.insuranceId,
      groupId: data.groupId,
      conditions: [],
      age: '',
      medications: '',
      bloodPressure: '',
      heartRate: '',
      otherVitals: '',
      doctors: [],
      medicationsList: [],
      lastUpdate: null
    };

    setPatients(prev => [...prev, newPatient]);
    setCurrentPatientId(newId);
    await savePatient(newPatient);
    setShowPatientFormModal(false);
    setActiveTab('profile');
  };

  const handleEditPatient = async (data) => {
    await updateActivePatient(data);
    setShowPatientFormModal(false);
    setEditingPatientData(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'chat' && homeView === 'chat') {
      scrollToBottom();
    }
  }, [activeChat.messages, activeTab, homeView]);

  const generateContextString = (patient) => {
    if (!patient) return "";
    let ctx = `Patient Name: ${patient.name}. `;
    if (patient.dob) ctx += `DOB: ${patient.dob}. `;
    if (patient.insuranceProvider) ctx += `Insurance: ${patient.insuranceProvider}. `;
    if (patient.conditions && patient.conditions.length > 0) ctx += `Conditions: ${patient.conditions.join(', ')}. `;
    if (patient.age) ctx += `Age: ${patient.age}. `;

    if (patient.medicationsList && patient.medicationsList.length > 0) {
      ctx += `Meds: ${patient.medicationsList.map(m => `${m.name} ${m.dosage}`).join(', ')}. `;
    } else if (patient.medications) {
      ctx += `Meds: ${patient.medications}. `;
    }

    if (patient.bloodPressure) ctx += `BP: ${patient.bloodPressure}. `;
    if (patient.heartRate) ctx += `HR: ${patient.heartRate}. `;
    if (patient.otherVitals) ctx += `Other Vitals: ${patient.otherVitals}. `;
    return ctx;
  };

  const [abortController, setAbortController] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return; // Allow sending only file

    const context = generateContextString(activePatient);

    // Construct debug info
    const currentDebugInfo = {
      prompt: input,
      context: context,
      systemInstruction: `You are CareCompass... (full system prompt hidden for brevity, but would be here)` // Ideally fetched from backend or shared constant
    };

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      debugInfo: currentDebugInfo,
      attachment: attachedFile ? {
        id: attachedFile.id,
        name: attachedFile.name,
        type: attachedFile.type
      } : null
    };

    let currentChat;
    let isNewChat = false;

    if (activeChatId) {
      currentChat = chats.find(c => c.id === activeChatId);
    }

    if (!currentChat) {
      isNewChat = true;
      currentChat = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        messages: []
      };
      setActiveChatId(currentChat.id);
    }

    const updatedMessages = [...currentChat.messages, userMsg];
    const updatedChat = { ...currentChat, messages: updatedMessages };

    // Optimistic update
    if (isNewChat) {
      setChats(prev => [updatedChat, ...prev]);
    } else {
      setChats(prev => prev.map(c => c.id === updatedChat.id ? updatedChat : c));
    }

    // Save user message immediately to backend so it persists
    await savePatientChat(currentPatientId, updatedChat);

    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    // Create AbortController
    const controller = new AbortController();
    setAbortController(controller);

    // Create placeholder AI message
    const aiMsgId = Date.now() + 1;
    const initialAiMsg = { id: aiMsgId, sender: 'ai', text: '' };

    // Add placeholder to UI immediately
    const messagesWithPlaceholder = [...updatedMessages, initialAiMsg];
    const chatWithPlaceholder = { ...updatedChat, messages: messagesWithPlaceholder };
    setChats(prev => prev.map(c => c.id === updatedChat.id ? chatWithPlaceholder : c));

    // Call Backend API with streaming callback
    const aiResponseText = await callChatAPI(
      input,
      null,
      context,
      updatedMessages,
      controller.signal,
      attachedFile ? attachedFile.type : 'image/jpeg',
      attachedFile ? attachedFile.id : null,
      currentPatientId,
      (partialText) => {
        // Update the specific message in the chat
        setChats(prev => prev.map(c => {
          if (c.id === updatedChat.id) {
            const newMessages = c.messages.map(m =>
              m.id === aiMsgId ? { ...m, text: partialText } : m
            );
            return { ...c, messages: newMessages };
          }
          return c;
        }));
      }
    );

    if (aiResponseText === null) {
      // Aborted - remove placeholder? Or keep partial?
      // Let's keep partial if any, or remove if empty.
      setIsLoading(false);
      setAbortController(null);
      return;
    }

    // Final update and save
    const finalAiMsg = { id: aiMsgId, sender: 'ai', text: aiResponseText };
    const finalMessages = [...updatedMessages, finalAiMsg];
    const finalChatSaved = { ...updatedChat, messages: finalMessages };

    setChats(prev => prev.map(c => c.id === updatedChat.id ? finalChatSaved : c));
    await savePatientChat(currentPatientId, finalChatSaved);

    setIsLoading(false);
    setAbortController(null);
  };

  const handleFileAnalyze = async (base64, previewUrl, mimeType = 'image/jpeg', fileId = null) => {
    setActiveTab('chat');
    setHomeView('chat');

    const isImage = mimeType.startsWith('image/');
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: isImage ? "Can you analyze this image for me?" : "Can you analyze this document for me?",
      image: isImage ? previewUrl : null // Only show preview if it's an image
    };

    // Always new chat for analysis for now
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      createdAt: new Date().toISOString(),
      messages: [userMsg]
    };

    setActiveChatId(newChatId);
    setChats(prev => [newChat, ...prev]);

    // Save immediately
    await savePatientChat(currentPatientId, newChat);

    setIsLoading(true);

    // Create placeholder AI message
    const aiMsgId = Date.now() + 1;
    const initialAiMsg = { id: aiMsgId, sender: 'ai', text: '' };

    // Add placeholder to UI immediately
    const messagesWithPlaceholder = [userMsg, initialAiMsg];
    const chatWithPlaceholder = { ...newChat, messages: messagesWithPlaceholder };
    setChats(prev => prev.map(c => c.id === newChatId ? chatWithPlaceholder : c));

    const context = generateContextString(activePatient);
    const prompt = isImage
      ? "Please analyze this image. If it's a medical chart or note, summarize the key findings simply."
      : "Please analyze this document. Summarize the key medical findings, dates, and actionable information.";

    const aiResponseText = await callChatAPI(
      prompt,
      base64,
      context,
      [userMsg],
      null,
      mimeType,
      fileId,
      currentPatientId,
      (partialText) => {
        setChats(prev => prev.map(c => {
          if (c.id === newChatId) {
            const newMessages = c.messages.map(m =>
              m.id === aiMsgId ? { ...m, text: partialText } : m
            );
            return { ...c, messages: newMessages };
          }
          return c;
        }));
      }
    );

    const finalAiMsg = { id: aiMsgId, sender: 'ai', text: aiResponseText };
    const finalMessages = [userMsg, finalAiMsg];
    const finalChat = { ...newChat, messages: finalMessages };

    setChats(prev => prev.map(c => c.id === newChatId ? finalChat : c));

    await savePatientChat(currentPatientId, finalChat);

    setIsLoading(false);
  };

  if (authLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-teal-600" /></div>;
  if (!user) return <Login />;

  // Force show Initial Setup if flag is set, regardless of activePatient
  if (showInitialSetup) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800">
        <InitialSetupForm onSave={handleInitialSetupSave} />
      </div>
    );
  }

  if (!activePatient) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800">
      <DebugInfoModal
        isOpen={!!debugInfo}
        onClose={() => setDebugInfo(null)}
        data={debugInfo}
      />



      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative no-scrollbar">

        {/* HOME TAB - Manages Subviews */}
        {activeTab === 'chat' && (
          <>
            {homeView === 'dashboard' && (
              <HomeDashboard
                patient={activePatient}
                chats={chats}
                allPatients={patients}
                onSwitchPatient={setCurrentPatientId}
                onAddPatient={() => {
                  setEditingPatientData(null);
                  setShowPatientFormModal(true);
                }}
                onNavigate={setHomeView}
                onAskClick={() => {
                  setActiveChatId(null); // Start new chat
                  setHomeView('chat');
                }}
                onChatSelect={(chat) => {
                  setActiveChatId(chat.id);
                  setHomeView('chat');
                }}
              />
            )}

            {homeView === 'chat' && (
              <ChatInterface
                patient={activePatient}
                messages={activeChat.messages}
                allPatients={patients}
                onSwitchPatient={setCurrentPatientId}
                onAddPatient={() => {
                  setEditingPatientData(null);
                  setShowPatientFormModal(true);
                }}
                isLoading={isLoading}
                onBack={() => setHomeView('dashboard')}
                onSend={handleSend}
                onStop={handleStop}
                onInfoClick={setDebugInfo}
                input={input}
                setInput={setInput}
                attachedFile={attachedFile}
                setAttachedFile={setAttachedFile}
                messagesEndRef={messagesEndRef}
              />
            )}

            {homeView === 'history' && (
              <HistoryList
                patient={activePatient}
                chats={chats}
                onBack={() => setHomeView('dashboard')}
                onSelect={(chat) => {
                  setActiveChatId(chat.id);
                  setHomeView('chat');
                }}
              />
            )}
          </>
        )}

        {/* DOCS & MEDS TAB */}
        {activeTab === 'docs_meds' && (
          <DocsMedsSection
            patient={activePatient}
            onUpdate={(updates) => {
              let mappedUpdates = { ...updates };
              if (updates.medicationsList) {
                // Sync the text field
                const medsString = updates.medicationsList.map(m => m.name).join(', ');
                mappedUpdates.medications = medsString;
              }
              updateActivePatient(mappedUpdates);
            }}
          />
        )}

        {/* PROFILE VIEW */}
        {activeTab === 'profile' && (
          <ProfileSection
            patient={activePatient}
            allPatients={patients}
            onSwitchPatient={setCurrentPatientId}
            onAddPatient={() => {
              setEditingPatientData(null);
              setShowPatientFormModal(true);
            }}
            onEditPatient={() => {
              setEditingPatientData(activePatient);
              setShowPatientFormModal(true);
            }}
            onUpdate={(updates) => {
              updateActivePatient({
                ...updates,
                lastUpdate: { type: 'vitals', time: new Date() }
              });
            }}
          />
        )}

        {/* FILES VIEW (Formerly Camera) */}
        {activeTab === 'files' && (
          <FilesView onFileAnalyze={handleFileAnalyze} patientId={currentPatientId} />
        )}

      </main>

      {homeView !== 'chat' && (
        <Navigation activeTab={activeTab} setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'chat') setHomeView('dashboard');
        }} />
      )}

      {/* MODALS */}
      <PatientFormModal
        isOpen={showPatientFormModal}
        onClose={() => setShowPatientFormModal(false)}
        onSave={editingPatientData ? handleEditPatient : handleAddPatient}
        initialData={editingPatientData}
      />

      {showOnboarding && (
        <OnboardingModal onComplete={() => {
          localStorage.setItem('hasSeenOnboarding', 'true');
          setShowOnboarding(false);
        }} />
      )}

      {showInitialSetup && (
        <InitialSetupForm onSave={handleInitialSetupSave} />
      )}

    </div>
  );
}
