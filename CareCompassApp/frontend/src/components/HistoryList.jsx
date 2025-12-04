import React from 'react';
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react';

const HistoryList = ({ patient, chats, onBack, onSelect }) => {
    return (
        <div className="flex flex-col h-full bg-slate-50 animate-fade-in pb-24">
            <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-4 z-10 flex items-center gap-3">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-lg text-slate-800">History: {patient.name}</span>
            </header>

            <div className="p-4 space-y-3">
                {chats.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">No questions yet for this profile.</div>
                ) : (
                    chats.map(chat => {
                        const firstUserMsg = chat.messages.find(m => m.sender === 'user');
                        const title = firstUserMsg ? firstUserMsg.text : "New Chat";
                        return (
                            <button
                                key={chat.id}
                                onClick={() => onSelect(chat)}
                                className="w-full text-left p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="text-slate-700 text-sm font-medium line-clamp-2">{title}</p>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0 ml-2 mt-0.5" />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-50 pt-2 mt-2">
                                    <Clock size={12} />
                                    <span>{new Date(chat.createdAt || chat.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>{new Date(chat.createdAt || chat.id).toLocaleDateString()}</span>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default HistoryList;
