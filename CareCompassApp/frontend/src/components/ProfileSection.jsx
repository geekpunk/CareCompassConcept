import React, { useState } from 'react';
import { Clock, Edit2, User, Activity, Heart, Stethoscope, Thermometer, X, Download, Upload } from 'lucide-react';
import PatientSelector from './PatientSelector';
import { exportPatient, importPatient } from '../api';

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
        return `Last saved ${new Date(patient.lastUpdate.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const handleExport = async () => {
        try {
            const data = await exportPatient(patient.id);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carecompass_export_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to export data');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!data.patient || !data.patient.id) {
                    throw new Error("Invalid format");
                }

                if (!window.confirm(`This will overwrite all data for ${data.patient.name}. Are you sure?`)) return;

                await importPatient(data);
                alert('Import successful! Please refresh or switch patients to see changes.');
                // Trigger a reload or update parent? Ideally we callback
                if (onSwitchPatient) onSwitchPatient(data.patient.id); // Force reload of this patient
            } catch (error) {
                console.error(error);
                alert('Failed to import data: ' + error.message);
            }
        };
        reader.readAsText(file);
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
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        title="Export Patient Data"
                    >
                        <Download size={18} /> <span className="hidden sm:inline">Export</span>
                    </button>
                    <label className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <Upload size={18} /> <span className="hidden sm:inline">Import</span>
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
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
                        <label className="block text-sm font-medium text-slate-600 mb-1">Age</label>
                        <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500">
                            {patient.age || 'Not set'}
                        </div>
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
                        <label className="block text-sm font-medium text-slate-600 mb-1">Height</label>
                        <div className="flex gap-2">
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                                value={patient.height ? patient.height.split(' ')[0] : ''}
                                onChange={(e) => {
                                    const unit = patient.height ? patient.height.split(' ')[1] : 'ft';
                                    onUpdate({ height: `${e.target.value} ${unit}`.trim() });
                                }}
                            >
                                <option value="">Select</option>
                                {[...Array(40)].map((_, i) => {
                                    const ft = Math.floor((i + 48) / 12);
                                    const inch = (i + 48) % 12;
                                    const val = `${ft}'${inch}`;
                                    return <option key={val} value={val}>{val}</option>;
                                })}
                            </select>
                            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm flex items-center justify-center min-w-[3rem]">
                                ft
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Weight</label>
                        <div className="flex gap-2">
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                                value={patient.weight ? patient.weight.split(' ')[0] : ''}
                                onChange={(e) => {
                                    const unit = patient.weight ? patient.weight.split(' ')[1] : 'lbs';
                                    onUpdate({ weight: `${e.target.value} ${unit}` });
                                }}
                            >
                                <option value="">Select</option>
                                {[...Array(40)].map((_, i) => {
                                    const val = (i * 5) + 50; // 50 to 250 in steps of 5
                                    return <option key={val} value={val}>{val}</option>;
                                })}
                                {[...Array(20)].map((_, i) => {
                                    const val = (i * 10) + 250; // 250 to 450 in steps of 10
                                    return <option key={val} value={val}>{val}</option>;
                                })}
                            </select>
                            <select
                                className="bg-slate-50 border border-slate-200 rounded-xl px-2 focus:outline-none"
                                value={patient.weight ? patient.weight.split(' ')[1] : 'lbs'}
                                onChange={(e) => {
                                    const val = patient.weight ? patient.weight.split(' ')[0] : '';
                                    onUpdate({ weight: `${val} ${e.target.value}` });
                                }}
                            >
                                <option value="lbs">lbs</option>
                                <option value="kg">kg</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Blood Pressure</label>
                        <div className="relative">
                            <Stethoscope size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                            <select
                                name="bloodPressure"
                                value={patient.bloodPressure || ''}
                                onChange={handleChange}
                                className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                            >
                                <option value="">Select BP</option>
                                <option value="Low (<90/60)">Low (&lt;90/60)</option>
                                <option value="Normal (120/80)">Normal (120/80)</option>
                                <option value="Elevated (125/80)">Elevated (125/80)</option>
                                <option value="Stage 1 (135/85)">Stage 1 (135/85)</option>
                                <option value="Stage 2 (145/95)">Stage 2 (145/95)</option>
                                <option value="Crisis (>180/120)">Crisis (&gt;180/120)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Heart Rate</label>
                        <div className="relative">
                            <Heart size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                            <select
                                name="heartRate"
                                value={patient.heartRate || ''}
                                onChange={handleChange}
                                className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                            >
                                <option value="">Select HR</option>
                                {[...Array(16)].map((_, i) => {
                                    const val = (i * 5) + 40; // 40 to 115
                                    return <option key={val} value={val}>{val} bpm</option>;
                                })}
                                <option value=">120 bpm">&gt;120 bpm</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Blood Glucose</label>
                    <div className="relative">
                        <Thermometer size={16} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                        <select
                            name="otherVitals"
                            value={patient.otherVitals || ''}
                            onChange={handleChange}
                            className="w-full pl-9 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                        >
                            <option value="">Select Glucose</option>
                            <option value="Low (<70 mg/dL)">Low (&lt;70 mg/dL)</option>
                            <option value="Normal (70-99 mg/dL)">Normal (70-99 mg/dL)</option>
                            <option value="Prediabetes (100-125 mg/dL)">Prediabetes (100-125 mg/dL)</option>
                            <option value="Diabetes (>126 mg/dL)">Diabetes (&gt;126 mg/dL)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;
