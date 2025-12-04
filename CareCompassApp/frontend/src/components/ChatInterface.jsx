import React, { useState } from 'react';
import { ArrowLeft, Heart, Loader2, Send, Square, Type, Paperclip, X, FileText } from 'lucide-react';
import PatientSelector from './PatientSelector';
import ChatMessage from './ChatMessage';
import FileSelectorModal from './FileSelectorModal';

const ChatInterface = ({ patient, messages, allPatients, onSwitchPatient, onAddPatient, isLoading, onBack, onSend, onStop, onInfoClick, input, setInput, attachedFile, setAttachedFile, messagesEndRef }) => {
    const [fontSize, setFontSize] = useState(15);
    const [showFontControl, setShowFontControl] = useState(false);
    const [showFileSelector, setShowFileSelector] = useState(false);

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
                    <span className="font-bold text-lg text-slate-800 hidden sm:inline">CareCompass</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Font Size Control */}
                    <div className="relative flex items-center">
                        <button
                            onClick={() => setShowFontControl(!showFontControl)}
                            className={`p-2 rounded-full transition-colors ${showFontControl ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Type size={18} />
                        </button>

                        {showFontControl && (
                            <div className="absolute top-full right-0 mt-2 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-2 min-w-[150px] animate-fade-in z-50">
                                <span className="text-xs text-slate-400">A</span>
                                <input
                                    type="range"
                                    min="12"
                                    max="24"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                />
                                <span className="text-sm text-slate-600 font-bold">A</span>
                            </div>
                        )}
                    </div>

                    <PatientSelector
                        currentPatient={patient}
                        allPatients={allPatients}
                        onSelect={onSwitchPatient}
                        onAdd={onAddPatient}
                    />
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} onInfoClick={onInfoClick} fontSize={fontSize} />
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
                <div className="max-w-3xl mx-auto">
                    {/* Attachment Preview */}
                    {attachedFile && (
                        <div className="mb-2 flex items-center gap-2 bg-slate-100 w-fit p-2 rounded-lg border border-slate-200 animate-fade-in">
                            <div className="bg-white p-1 rounded text-teal-600">
                                <FileText size={14} />
                            </div>
                            <span className="text-xs font-medium text-slate-700 max-w-[200px] truncate">{attachedFile.name}</span>
                            <button
                                onClick={() => setAttachedFile(null)}
                                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => setShowFileSelector(true)}
                            className="p-3.5 rounded-xl flex-shrink-0 transition-all bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                            title="Attach file"
                            disabled={isLoading}
                        >
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && onSend()}
                            placeholder={`Ask about ${patient.name.split(' ')[0]}'s health...`}
                            className="flex-1 p-3.5 bg-slate-100 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 placeholder:text-slate-400 max-h-32 overflow-y-auto resize-none"
                            autoFocus
                            disabled={isLoading}
                            style={{ fontSize: `${fontSize}px` }}
                        />

                        {isLoading ? (
                            <button
                                onClick={onStop}
                                className="p-3.5 rounded-xl flex-shrink-0 transition-all bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                            >
                                <Square size={20} fill="currentColor" />
                            </button>
                        ) : (
                            <button
                                onClick={onSend}
                                disabled={!input.trim()}
                                className={`p-3.5 rounded-xl flex-shrink-0 transition-all ${input.trim() ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' : 'bg-slate-100 text-slate-300'}`}
                            >
                                <Send size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showFileSelector && (
                <FileSelectorModal
                    patientId={patient.id}
                    onSelect={(file) => {
                        setAttachedFile(file);
                        setShowFileSelector(false);
                    }}
                    onClose={() => setShowFileSelector(false)}
                />
            )}
        </div>
    );
};

export default ChatInterface;
