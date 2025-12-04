import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';

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

    if (!currentPatient) return null;

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

export default PatientSelector;
