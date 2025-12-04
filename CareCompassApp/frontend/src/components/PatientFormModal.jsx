import React, { useState, useEffect } from 'react';
import { User, Calendar, CreditCard, Hash, Users, X } from 'lucide-react';

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

export default PatientFormModal;
