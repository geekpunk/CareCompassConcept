import React from 'react';
import { Heart, MessageCircle, ChevronRight, History } from 'lucide-react';
import PatientSelector from './PatientSelector';
import StatusWidget from './StatusWidget';

const HomeDashboard = ({ patient, chats, allPatients, onSwitchPatient, onAddPatient, onNavigate, onAskClick, onChatSelect }) => {
    const recentChats = chats.slice(0, 3);

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

            {/* Recent Threads */}
            <div>
                <div className="mb-4 px-1">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Threads</h2>
                </div>

                <div className="space-y-3">
                    {recentChats.length === 0 ? (
                        <div className="text-slate-400 text-sm italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                            No conversations yet.
                        </div>
                    ) : (
                        recentChats.map(chat => {
                            const firstUserMsg = chat.messages.find(m => m.sender === 'user');
                            const title = firstUserMsg ? firstUserMsg.text : "New Chat";
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => onChatSelect(chat)}
                                    className="w-full text-left bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-slate-700 text-sm truncate hover:bg-slate-50 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex flex-col truncate pr-4">
                                        <span className="truncate font-medium text-slate-700">{title}</span>
                                        <span className="text-xs text-slate-400 mt-1">
                                            {new Date(chat.createdAt || chat.id).toLocaleDateString()} • {new Date(chat.createdAt || chat.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <History size={14} className="text-slate-300 group-hover:text-teal-500 flex-shrink-0" />
                                </button>
                            );
                        })
                    )}
                </div>

                {/* View All Button */}
                {recentChats.length > 0 && (
                    <button
                        onClick={() => onNavigate('history')}
                        className="w-full mt-4 py-3 text-teal-600 text-xs font-bold hover:bg-teal-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                        View All Threads <ChevronRight size={12} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default HomeDashboard;
