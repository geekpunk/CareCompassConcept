import React, { useState, useEffect, useRef } from 'react';
import {
    Heart,
    MessageCircle,
    Camera,
    User,
    Send,
    Activity,
    X,
    ChevronRight,
    Loader2,
    Plus,
    FileText,
    Thermometer,
    Stethoscope,
    Image as ImageIcon,
    Clock,
    History,
    ArrowLeft,
    Users,
    Calendar,
    CreditCard,
    ChevronDown,
    Check,
    Hash,
    BriefcaseMedical,
    Pill,
    Phone,
    Trash2,
    Edit2,
    Folder,
    Download,
    Save,
    ShieldCheck,
    Database,
    ArrowRight
} from 'lucide-react';

// --- API HANDLING ---

const callGeminiAPI = async (prompt, imageBase64 = null, context = "", history = []) => {
    const apiKey = ""; // Injected at runtime
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

    const systemInstruction = `
    You are CareCompass, a supportive and compassionate health assistant for patients and caregivers.
    
    Current Patient Context:
    ${context ? context : "No specific patient details provided yet."}
    
    Guidelines:
    1. Tone: Warm, reassuring, simple, and non-judgmental. Avoid overly complex medical jargon.
    2. Role: Explain medical concepts, lab results, and general wellness. 
    3. Safety: ALWAYS state that you are an AI and not a doctor. If the user mentions severe symptoms (chest pain, trouble breathing, etc.), immediately advise them to seek emergency care.
    4. Input: You may receive text questions or images of medical notes/charts. Summarize images clearly.
  `;

    const contents = [];

    history.slice(-4).forEach(msg => {
        contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    });

    const parts = [{ text: prompt }];
    if (imageBase64) {
        parts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64
            }
        });
    }

    contents.push({ role: "user", parts });

    const payload = {
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
        }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i <= delays.length; i++) {
        try {
            const response = await fetch(`${baseUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble understanding right now. Could you try again?";
        } catch (error) {
            if (i === delays.length) return "I'm having trouble connecting to the service. Please check your connection and try again.";
            await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
    }
};

// --- COMPONENTS ---

const Navigation = ({ activeTab, setActiveTab }) => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-3 flex justify-around items-center z-50 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'chat' ? 'text-teal-600' : 'text-slate-400'}`}
        >
            <MessageCircle size={22} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
            onClick={() => setActiveTab('docs_meds')}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'docs_meds' ? 'text-teal-600' : 'text-slate-400'}`}
        >
            <BriefcaseMedical size={22} strokeWidth={activeTab === 'docs_meds' ? 2.5 : 2} />
            <span className="text-[10px] font-medium text-center leading-tight">Docs & Meds</span>
        </button>

        <button
            onClick={() => setActiveTab('files')}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'files' ? 'text-teal-600' : 'text-slate-400'}`}
        >
            <Folder size={22} strokeWidth={activeTab === 'files' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Files</span>
        </button>

        <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'profile' ? 'text-teal-600' : 'text-slate-400'}`}
        >
            <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">My Health</span>
        </button>
    </nav>
);

const OnboardingModal = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: <Heart size={48} className="text-teal-600" fill="currentColor" />,
            title: "Welcome to CareCompass",
            description: "Your personal health companion. I'm here to help you understand your health conditions, explain medical notes, and answer your care questions simply and clearly."
        },
        {
            icon: <Database size={48} className="text-indigo-600" />,
            title: "Better Context, Better Care",
            description: "The more details you add to 'Docs & Meds' and your 'My Health' profile, the smarter I become. Sharing your vitals and history helps me give you personalized answers."
        },
        {
            icon: <ShieldCheck size={48} className="text-teal-600" />,
            title: "You Are In Control",
            description: "This is an open source project designed to empower you. Remember, you are in charge of your health decisions. I am an AI support tool, not a doctor."
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-teal-600' : 'w-2 bg-slate-200'}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="mb-8 p-6 bg-slate-50 rounded-full shadow-sm animate-in zoom-in duration-500">
                        {steps[step].icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{steps[step].title}</h2>
                    <p className="text-slate-500 leading-relaxed">
                        {steps[step].description}
                    </p>
                </div>

                {/* Actions */}
                <button
                    onClick={handleNext}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
                >
                    {step === steps.length - 1 ? "Get Started" : "Next"}
                    {step !== steps.length - 1 && <ArrowRight size={20} />}
                </button>

                {step < steps.length - 1 && (
                    <button
                        onClick={onComplete}
                        className="text-slate-400 text-sm font-medium hover:text-slate-600"
                    >
                        Skip Intro
                    </button>
                )}
            </div>
        </div>
    );
};

const ChatMessage = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-teal-100 text-teal-600'}`}>
                    {isUser ? <User size={16} /> : <Heart size={16} />}
                </div>
                <div
                    className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap
            ${isUser
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                        }`}
                >
                    {message.image && (
                        <img src={message.image} alt="User upload" className="max-w-full h-auto rounded-lg mb-3 border border-white/20" />
                    )}
                    {message.text}
                </div>
            </div>
        </div>
    );
};

const PatientSelector = ({ currentPatient, allPatients, onSelect, onAdd, triggerClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1 transition-colors ${triggerClassName || 'bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-sm font-semibold'}`}
            >
                <span className="truncate max-w-[200px]">{currentPatient.name}</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Switch Profile</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {allPatients.map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    onSelect(p.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${p.id === currentPatient.id ? 'bg-teal-50 text-teal-700' : 'text-slate-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.id === currentPatient.id ? 'bg-teal-200 text-teal-800' : 'bg-slate-200 text-slate-500'}`}>
                                        {p.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-sm">{p.name}</span>
                                </div>
                                {p.id === currentPatient.id && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                    <div className="p-2 border-t border-slate-100">
                        <button
                            onClick={() => {
                                onAdd();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 justify-center py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                        >
                            <Plus size={16} />
                            Add New Patient
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const DocsMedsSection = ({ patient, onUpdate }) => {
    const [subTab, setSubTab] = useState('docs'); // 'docs' | 'meds'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // null = adding new
    const [formData, setFormData] = useState({});

    const openAddModal = () => {
        setEditingItem(null);
        setFormData({});
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const listKey = subTab === 'docs' ? 'doctors' : 'medicationsList';
        const currentList = patient[listKey] || [];
        let newList;

        if (editingItem) {
            // Update existing
            newList = currentList.map(item => item.id === editingItem.id ? { ...formData, id: editingItem.id } : item);
        } else {
            // Add new
            newList = [...currentList, { ...formData, id: Date.now().toString() }];
        }

        onUpdate({ [listKey]: newList });
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        const listKey = subTab === 'docs' ? 'doctors' : 'medicationsList';
        const currentList = patient[listKey] || [];
        const newList = currentList.filter(item => item.id !== id);
        onUpdate({ [listKey]: newList });
    };

    return (
        <div className="p-6 pb-24 h-full flex flex-col animate-fade-in">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Care Team & Meds</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage providers and prescriptions for {patient.name.split(' ')[0]}.</p>
                </div>
            </header>

            {/* Toggle Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
                <button
                    onClick={() => setSubTab('docs')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${subTab === 'docs' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Stethoscope size={16} /> Doctors
                </button>
                <button
                    onClick={() => setSubTab('meds')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${subTab === 'meds' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Pill size={16} /> Medications
                </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto space-y-3 pb-20">
                {subTab === 'docs' ? (
                    (patient.doctors || []).length === 0 ? (
                        <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-400">
                                <Stethoscope size={24} />
                            </div>
                            <p className="text-slate-500 font-medium">No doctors added yet</p>
                            <p className="text-slate-400 text-xs mt-1">Keep track of your care team here</p>
                        </div>
                    ) : (
                        patient.doctors.map(doc => (
                            <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-teal-50 text-teal-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{doc.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{doc.type}</p>
                                        {doc.phone && (
                                            <a href={`tel:${doc.phone}`} className="flex items-center gap-1 text-xs text-teal-600 mt-0.5 hover:underline">
                                                <Phone size={10} /> {doc.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEditModal(doc)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    (patient.medicationsList || []).length === 0 ? (
                        <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-400">
                                <Pill size={24} />
                            </div>
                            <p className="text-slate-500 font-medium">No medications added</p>
                            <p className="text-slate-400 text-xs mt-1">Track prescriptions and dosages</p>
                        </div>
                    ) : (
                        patient.medicationsList.map(med => (
                            <div key={med.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                        <Pill size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{med.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{med.dosage}</span>
                                            <span>• {med.frequency}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEditModal(med)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(med.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={openAddModal}
                className="fixed bottom-24 right-6 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg shadow-teal-600/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40"
            >
                <Plus size={28} />
            </button>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">
                                {editingItem ? 'Edit' : 'Add'} {subTab === 'docs' ? 'Doctor' : 'Medication'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {subTab === 'docs' ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Doctor Name</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Dr. Emily Smith"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Specialty / Type</label>
                                        <input
                                            type="text"
                                            value={formData.type || ''}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            placeholder="e.g. Cardiologist"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone || ''}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="e.g. 555-0123"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Medication Name</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Lisinopril"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dosage</label>
                                        <input
                                            type="text"
                                            value={formData.dosage || ''}
                                            onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                                            placeholder="e.g. 10mg"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Frequency</label>
                                        <input
                                            type="text"
                                            value={formData.frequency || ''}
                                            onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                            placeholder="e.g. Once daily in morning"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                            <button
                                onClick={handleSave}
                                disabled={!formData.name}
                                className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all"
                            >
                                Save {subTab === 'docs' ? 'Doctor' : 'Medication'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PatientFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        insuranceProvider: '',
        insuranceId: '',
        groupId: ''
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        } else if (isOpen) {
            setFormData({
                name: '',
                dob: '',
                insuranceProvider: '',
                insuranceId: '',
                groupId: ''
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Profile' : 'Add New Patient'}</h2>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Jane Doe"
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-3.5 text-slate-400" />
                            <input
                                type="date"
                                value={formData.dob || ''}
                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Insurance Provider</label>
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-3 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.insuranceProvider || ''}
                                    onChange={e => setFormData({ ...formData, insuranceProvider: e.target.value })}
                                    placeholder="e.g. BlueCross"
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Member ID</label>
                                <div className="relative">
                                    <Hash size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.insuranceId || ''}
                                        onChange={e => setFormData({ ...formData, insuranceId: e.target.value })}
                                        placeholder="ID Number"
                                        className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Group ID</label>
                                <div className="relative">
                                    <Users size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.groupId || ''}
                                        onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                                        placeholder="Group #"
                                        className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-2 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={() => onSave(formData)}
                        disabled={!formData.name}
                        className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-teal-600/20 transition-all"
                    >
                        {initialData ? 'Save Changes' : 'Create Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatusWidget = ({ lastUpdate }) => {
    const getStatusText = () => {
        if (!lastUpdate) return "No context updates yet";
        const time = lastUpdate.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (lastUpdate.type === 'vitals') return `Vitals updated today at ${time}`;
        if (lastUpdate.type === 'scan') return `Document scanned today at ${time}`;
        return "Context up to date";
    };

    return (
        <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-xl p-4 flex items-center justify-between shadow-sm border border-teal-100/50">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full text-teal-600 shadow-sm">
                    {lastUpdate?.type === 'scan' ? <FileText size={18} /> : <Activity size={18} />}
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Context</p>
                    <p className="text-sm font-medium text-slate-800">{getStatusText()}</p>
                </div>
            </div>
            {lastUpdate && <div className="text-teal-600"><Clock size={16} /></div>}
        </div>
    );
};

// --- SUB-VIEWS FOR HOME TAB ---

const HomeDashboard = ({ patient, allPatients, onSwitchPatient, onAddPatient, onNavigate, onAskClick }) => {
    const userQuestions = patient.messages.filter(m => m.sender === 'user').slice(-3).reverse();

    return (
        <div className="flex flex-col min-h-full pb-24 p-6 animate-fade-in">
            {/* Header */}
            <header className="mb-8 flex justify-between items-start mt-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-800">Hello</span>
                        <PatientSelector
                            currentPatient={patient}
                            allPatients={allPatients}
                            onSelect={onSwitchPatient}
                            onAdd={onAddPatient}
                            triggerClassName="text-2xl font-bold text-slate-800 hover:text-teal-600 transition-colors"
                        />
                    </div>
                    <p className="text-slate-500 text-sm mt-1">How can I help you today?</p>
                </div>
                <div className="bg-teal-100 text-teal-700 p-2 rounded-full shadow-sm">
                    <Heart size={24} fill="currentColor" />
                </div>
            </header>

            {/* Ask AI Trigger Button */}
            <button
                onClick={onAskClick}
                className="w-full bg-white border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl p-4 flex items-center gap-4 text-slate-400 mb-8 hover:border-teal-500/50 hover:shadow-md transition-all group text-left"
            >
                <div className="bg-teal-600 p-3 rounded-xl text-white group-hover:scale-110 transition-transform shadow-md shadow-teal-600/20">
                    <MessageCircle size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-lg text-slate-700">Ask a Question</span>
                    <span className="text-xs text-slate-400">Tap to start chatting with AI</span>
                </div>
                <div className="ml-auto text-teal-600">
                    <ChevronRight size={24} />
                </div>
            </button>

            {/* Status Widget */}
            <div className="mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Context Status</h2>
                <StatusWidget lastUpdate={patient.lastUpdate} />
            </div>

            {/* Recent Questions */}
            <div>
                <div className="mb-4 px-1">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Questions</h2>
                </div>

                <div className="space-y-3">
                    {userQuestions.length === 0 ? (
                        <div className="text-slate-400 text-sm italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                            No questions asked yet.
                        </div>
                    ) : (
                        userQuestions.map(q => (
                            <button
                                key={q.id}
                                onClick={onAskClick}
                                className="w-full text-left bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-slate-700 text-sm truncate hover:bg-slate-50 transition-colors flex items-center justify-between group"
                            >
                                <span className="truncate flex-1 pr-4">{q.text}</span>
                                <History size={14} className="text-slate-300 group-hover:text-teal-500" />
                            </button>
                        ))
                    )}
                </div>

                {/* View All Button */}
                {userQuestions.length > 0 && (
                    <button
                        onClick={() => onNavigate('history')}
                        className="w-full mt-4 py-3 text-teal-600 text-xs font-bold hover:bg-teal-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                        View All Questions <ChevronRight size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

const ChatInterface = ({ patient, allPatients, onSwitchPatient, onAddPatient, isLoading, onBack, onSend, input, setInput, messagesEndRef }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in relative">
            {/* Header */}
            <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 z-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="bg-teal-600 p-1.5 rounded-lg">
                        <Heart size={14} className="text-white" fill="currentColor" />
                    </div>
                    <span className="font-bold text-lg text-slate-800">CareCompass</span>
                </div>

                <PatientSelector
                    currentPatient={patient}
                    allPatients={allPatients}
                    onSelect={onSwitchPatient}
                    onAdd={onAddPatient}
                />
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                {patient.messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-6 animate-pulse">
                        <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-teal-600" />
                            <span className="text-sm text-slate-500">CareCompass is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-30 safe-area-bottom pb-8 sm:pb-4">
                <div className="max-w-3xl mx-auto flex items-end gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSend()}
                        placeholder={`Ask about ${patient.name.split(' ')[0]}'s health...`}
                        className="flex-1 p-3.5 bg-slate-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 placeholder:text-slate-400 max-h-32 overflow-y-auto resize-none"
                        autoFocus
                    />
                    <button
                        onClick={onSend}
                        disabled={!input.trim() || isLoading}
                        className={`p-3.5 rounded-xl flex-shrink-0 transition-all ${input.trim() ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' : 'bg-slate-100 text-slate-300'}`}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const HistoryList = ({ patient, onBack, onSelect }) => {
    const userQuestions = patient.messages.filter(m => m.sender === 'user').reverse();

    return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in pb-24">
            <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 z-10 flex items-center gap-3">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-lg text-slate-800">History: {patient.name}</span>
            </header>

            <div className="p-4 space-y-3">
                {userQuestions.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">No questions yet for this profile.</div>
                ) : (
                    userQuestions.map(q => (
                        <button
                            key={q.id}
                            onClick={() => onSelect(q)}
                            className="w-full text-left p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-slate-700 text-sm font-medium line-clamp-2">{q.text}</p>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0 ml-2 mt-0.5" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-50 pt-2 mt-2">
                                <Clock size={12} />
                                <span>{new Date(q.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-slate-300">•</span>
                                <span>{new Date(q.id).toLocaleDateString()}</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

const ProfileSection = ({ patient, allPatients, onSwitchPatient, onAddPatient, onUpdate, onEditPatient }) => {
    const [tagInput, setTagInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        onUpdate({ [name]: value });
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim();
            const currentConditions = patient.conditions || [];
            if (!currentConditions.includes(newTag)) {
                onUpdate({ conditions: [...currentConditions, newTag] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        onUpdate({ conditions: (patient.conditions || []).filter(t => t !== tagToRemove) });
    };

    const getLastSavedText = () => {
        if (!patient.lastUpdate) return "Not saved yet";
        return `Last saved ${patient.lastUpdate.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="p-6 pb-24 space-y-6 animate-fade-in">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Health Context</h1>
                    <div className="flex items-center gap-2">
                        <PatientSelector
                            currentPatient={patient}
                            allPatients={allPatients}
                            onSelect={onSwitchPatient}
                            onAdd={onAddPatient}
                        />
                    </div>
                    <p className="text-slate-500 mt-2 text-xs font-medium flex items-center gap-1">
                        <Clock size={12} /> {getLastSavedText()}
                    </p>
                </div>
            </header>

            {/* Basic Info Read-Only (from Add Flow) */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden group">
                <button
                    onClick={onEditPatient}
                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-20 backdrop-blur-sm"
                >
                    <Edit2 size={16} className="text-white" />
                </button>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                            <User size={20} className="text-white" />
                        </div>
                        <h2 className="font-semibold text-lg">{patient.name}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-indigo-100">
                        <div>
                            <p className="text-xs opacity-60 uppercase tracking-wider mb-1">Date of Birth</p>
                            <p className="font-medium">{patient.dob || 'Not set'}</p>
                        </div>
                        <div>
                            <p className="text-xs opacity-60 uppercase tracking-wider mb-1">Insurance</p>
                            <p className="font-medium">{patient.insuranceProvider || 'Not set'}</p>
                        </div>
                        {patient.insuranceId && (
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider mb-1">Member ID</p>
                                <p className="font-medium font-mono text-xs">{patient.insuranceId}</p>
                            </div>
                        )}
                        {patient.groupId && (
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider mb-1">Group ID</p>
                                <p className="font-medium font-mono text-xs">{patient.groupId}</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Decorative Background */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Editable Health Context */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-teal-700 mb-2">
                    <Activity size={20} />
                    <h2 className="font-semibold">Medical Conditions</h2>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Diagnoses (Tags)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {(patient.conditions || []).map(tag => (
                            <span key={tag} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border border-teal-100">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="hover:text-teal-900 ml-1">
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Type condition & press Enter"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 placeholder:text-slate-400"
                    />
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Age (Calculated)</label>
                        <input
                            type="text"
                            name="age"
                            value={patient.age || ''}
                            onChange={handleChange}
                            placeholder="Years"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                    <Heart size={20} />
                    <h2 className="font-semibold">Latest Vitals</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Blood Pressure</label>
                        <div className="relative">
                            <Stethoscope size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                name="bloodPressure"
                                value={patient.bloodPressure || ''}
                                onChange={handleChange}
                                placeholder="120/80"
                                className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Heart Rate</label>
                        <div className="relative">
                            <Heart size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                name="heartRate"
                                value={patient.heartRate || ''}
                                onChange={handleChange}
                                placeholder="BPM"
                                className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Blood Sugar / Other</label>
                    <div className="relative">
                        <Thermometer size={16} className="absolute left-3 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            name="otherVitals"
                            value={patient.otherVitals || ''}
                            onChange={handleChange}
                            placeholder="e.g. Glucose 110 mg/dL"
                            className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... FilesView, DocsMedsSection etc existing code ...

const FilesView = ({ onImageAnalyze }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Dummy recent files for display
    const recentFiles = [
        { id: 1, name: 'Lab_Results_Oct12.pdf', date: 'Oct 12, 2023', type: 'Lab Report' },
        { id: 2, name: 'Discharge_Summary_Sep05.jpg', date: 'Sep 05, 2023', type: 'Hospital Note' },
        { id: 3, name: 'Prescription_Lisinopril.png', date: 'Aug 20, 2023', type: 'Prescription' },
    ];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!preview) return;
        setAnalyzing(true);
        const base64Data = preview.split(',')[1];
        await onImageAnalyze(base64Data, preview);
        setAnalyzing(false);
        setPreview(null);
    };

    return (
        <div className="flex flex-col h-full p-6 pb-24 animate-fade-in">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">My Files</h1>
                <p className="text-slate-500 mt-2">Scan or upload medical documents.</p>
            </header>

            {/* Upload Area */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 relative overflow-hidden group min-h-[300px]">
                {preview ? (
                    <div className="relative w-full h-full">
                        <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
                        <button
                            onClick={() => setPreview(null)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-8 pointer-events-none">
                        <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Camera size={40} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Tap to Scan or Upload</h3>
                        <p className="text-slate-400 text-sm mt-2">Supports clear text and charts</p>
                    </div>
                )}

                {!preview && (
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                )}
            </div>

            <div className="mt-6 mb-8">
                {preview ? (
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Analyzing Image...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Analyze with AI
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                        <ImageIcon size={20} />
                        Select from Gallery
                    </button>
                )}
            </div>

            {/* Recent Files Section */}
            <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Documents</h2>
                <div className="space-y-3">
                    {recentFiles.map(file => (
                        <div key={file.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                                    <p className="text-xs text-slate-400">{file.date} • {file.type}</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors">
                                <Download size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [activeTab, setActiveTab] = useState('chat');
    const [homeView, setHomeView] = useState('dashboard');
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPatientFormModal, setShowPatientFormModal] = useState(false);
    const [editingPatientData, setEditingPatientData] = useState(null);
    const [showOnboarding, setShowOnboarding] = useState(true);

    const messagesEndRef = useRef(null);

    // Initial State Data
    const initialMessages = [
        {
            id: 1,
            sender: 'ai',
            text: "Hello. I'm CareCompass. I can help answer questions about your health, explain medical notes, or track your wellness.\n\nHow are you feeling today?"
        },
        { id: 2, sender: 'user', text: "what does it mean when they say ambulitory" },
        { id: 3, sender: 'ai', text: "Ambulatory simply means \"able to walk.\" In a medical context, it often refers to a patient who is not confined to a bed, or a procedure that doesn't require an overnight hospital stay (often called \"outpatient\")." },
        { id: 4, sender: 'user', text: "why cant i eat pomegranets with this medication" },
        { id: 5, sender: 'ai', text: "Pomegranates, like grapefruits, contain compounds that can interfere with enzymes in your body (specifically CYP3A4) that break down certain medications. \n\nThis can lead to higher levels of the drug in your bloodstream, potentially increasing the risk of side effects. It's common with statins, blood thinners, and some blood pressure medications." },
        { id: 6, sender: 'user', text: "what does this note from my doctor mean" },
        { id: 7, sender: 'ai', text: "I'd be happy to help. Could you please share a photo of the note or type out what it says? Context is helpful for me to give you the best explanation." }
    ];

    const [patients, setPatients] = useState([
        {
            id: '1',
            name: 'Sarah (Self)',
            dob: '1980-05-15',
            insuranceProvider: 'Blue Cross',
            conditions: ['Type 2 Diabetes'],
            age: '44',
            medications: 'Metformin',
            // New fields initialized empty or with dummy data
            doctors: [
                { id: '1', name: 'Dr. Emily Chen', type: 'Endocrinologist', phone: '555-0123' },
                { id: '2', name: 'Dr. James Wilson', type: 'Primary Care', phone: '555-0199' }
            ],
            medicationsList: [
                { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
                { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }
            ],
            bloodPressure: '120/80',
            heartRate: '72',
            otherVitals: 'Glucose 110',
            messages: initialMessages,
            lastUpdate: null
        }
    ]);

    const [currentPatientId, setCurrentPatientId] = useState('1');

    // Helper to get active patient object
    const activePatient = patients.find(p => p.id === currentPatientId) || patients[0];

    // Helper to update active patient
    const updateActivePatient = (updates) => {
        setPatients(prev => prev.map(p =>
            p.id === currentPatientId ? { ...p, ...updates } : p
        ));
    };

    // Helper to add message to active patient
    const addMessageToActivePatient = (msg) => {
        updateActivePatient({
            messages: [...activePatient.messages, msg]
        });
    };

    const handleAddPatient = (data) => {
        const newId = Date.now().toString();
        const newPatient = {
            id: newId,
            name: data.name,
            dob: data.dob,
            insuranceProvider: data.insuranceProvider,
            insuranceId: data.insuranceId,
            groupId: data.groupId,
            conditions: [],
            age: '', // Could calculate from DOB
            medications: '',
            bloodPressure: '',
            heartRate: '',
            otherVitals: '',
            doctors: [],
            medicationsList: [],
            messages: [{
                id: Date.now(),
                sender: 'ai',
                text: `Hello. I've created a new profile for ${data.name}. How can I assist with their care today?`
            }],
            lastUpdate: null
        };

        setPatients(prev => [...prev, newPatient]);
        setCurrentPatientId(newId);
        setShowPatientFormModal(false);
        setActiveTab('profile'); // Switch to profile to encourage filling more details
    };

    const handleEditPatient = (data) => {
        updateActivePatient(data);
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
    }, [activePatient.messages, activeTab, homeView]);

    const generateContextString = (patient) => {
        let ctx = `Patient Name: ${patient.name}. `;
        if (patient.dob) ctx += `DOB: ${patient.dob}. `;
        if (patient.insuranceProvider) ctx += `Insurance: ${patient.insuranceProvider}. `;
        if (patient.conditions && patient.conditions.length > 0) ctx += `Conditions: ${patient.conditions.join(', ')}. `;
        if (patient.age) ctx += `Age: ${patient.age}. `;

        // Use the structured meds list if available for better context
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

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: input };
        addMessageToActivePatient(userMsg);
        setInput('');
        setIsLoading(true);

        const context = generateContextString(activePatient);
        // Use activePatient.messages which includes the new userMsg (we must manually append for the API call context to be up to date instantly)
        const currentHistory = [...activePatient.messages, userMsg];

        const aiResponseText = await callGeminiAPI(input, null, context, currentHistory);

        const aiMsg = { id: Date.now() + 1, sender: 'ai', text: aiResponseText };
        // We can't just call addMessageToActivePatient because the closure might have stale state if rapid firing, 
        // but typically safely handled via functional updates in updateActivePatient
        setPatients(prev => prev.map(p => {
            if (p.id === currentPatientId) {
                return { ...p, messages: [...p.messages, aiMsg] };
            }
            return p;
        }));
        setIsLoading(false);
    };

    const handleImageAnalyze = async (base64, previewUrl) => {
        setActiveTab('chat');
        setHomeView('chat');
        updateActivePatient({ lastUpdate: { type: 'scan', time: new Date() } });

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: "Can you analyze this image for me?",
            image: previewUrl
        };

        // Optimistic update for UI
        const updatedMessages = [...activePatient.messages, userMsg];
        updateActivePatient({ messages: updatedMessages });

        setIsLoading(true);

        const context = generateContextString(activePatient);
        const prompt = "Please analyze this image. If it's a medical chart or note, summarize the key findings simply. If it's something else, describe it relevant to health.";

        const aiResponseText = await callGeminiAPI(prompt, base64, context, updatedMessages);

        const aiMsg = { id: Date.now() + 1, sender: 'ai', text: aiResponseText };
        setPatients(prev => prev.map(p => {
            if (p.id === currentPatientId) {
                return { ...p, messages: [...p.messages, aiMsg] };
            }
            return p;
        }));
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800">

            {showOnboarding && (
                <OnboardingModal onComplete={() => setShowOnboarding(false)} />
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative no-scrollbar">

                {/* HOME TAB - Manages Subviews */}
                {activeTab === 'chat' && (
                    <>
                        {homeView === 'dashboard' && (
                            <HomeDashboard
                                patient={activePatient}
                                allPatients={patients}
                                onSwitchPatient={setCurrentPatientId}
                                onAddPatient={() => {
                                    setEditingPatientData(null);
                                    setShowPatientFormModal(true);
                                }}
                                onNavigate={setHomeView}
                                onAskClick={() => setHomeView('chat')}
                            />
                        )}

                        {homeView === 'chat' && (
                            <ChatInterface
                                patient={activePatient}
                                allPatients={patients}
                                onSwitchPatient={setCurrentPatientId}
                                onAddPatient={() => {
                                    setEditingPatientData(null);
                                    setShowPatientFormModal(true);
                                }}
                                isLoading={isLoading}
                                onBack={() => setHomeView('dashboard')}
                                onSend={handleSend}
                                input={input}
                                setInput={setInput}
                                messagesEndRef={messagesEndRef}
                            />
                        )}

                        {homeView === 'history' && (
                            <HistoryList
                                patient={activePatient}
                                onBack={() => setHomeView('dashboard')}
                                onSelect={() => setHomeView('chat')}
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
                    <FilesView onImageAnalyze={handleImageAnalyze} />
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

        </div>
    );
}