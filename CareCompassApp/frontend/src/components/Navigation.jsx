import React from 'react';
import { MessageCircle, BriefcaseMedical, Folder, User } from 'lucide-react';

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

export default Navigation;
