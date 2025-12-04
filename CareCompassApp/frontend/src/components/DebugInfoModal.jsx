import React from 'react';
import { X, FileText, Database, MessageSquare } from 'lucide-react';

const DebugInfoModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Database size={18} className="text-teal-600" />
                        LLM Context Debugger
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    {/* System Prompt */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={14} /> System Instruction
                        </h4>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-60 overflow-y-auto">
                            {data.systemInstruction}
                        </div>
                    </div>

                    {/* Context */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Database size={14} /> Patient Context
                        </h4>
                        <div className="bg-indigo-50 text-indigo-900 p-4 rounded-xl text-sm border border-indigo-100">
                            {data.context}
                        </div>
                    </div>

                    {/* Full Prompt */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare size={14} /> User Prompt
                        </h4>
                        <div className="bg-white border border-slate-200 p-4 rounded-xl text-sm text-slate-700 shadow-sm">
                            {data.prompt}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebugInfoModal;
