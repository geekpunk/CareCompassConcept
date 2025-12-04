import React, { useState } from 'react';
import { User, Calendar, CreditCard, Hash, Users, Heart, Stethoscope, Thermometer } from 'lucide-react';

const InitialSetupForm = ({ onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        insuranceProvider: '',
        insuranceId: '',
        groupId: '',
        height: '',
        weight: '',
        bloodPressure: '',
        heartRate: '',
        otherVitals: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    return (
        <div className="fixed inset-0 bg-slate-50 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 bg-teal-600 text-white">
                    <h2 className="text-3xl font-bold">Welcome to CareCompass</h2>
                    <p className="text-teal-100 mt-2">Let's get your profile set up to provide you with the best care.</p>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <User size={20} className="text-teal-600" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Jane Doe"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={formData.dob}
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Heart size={20} className="text-teal-600" />
                            Basic Vitals (Optional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Height</label>
                                <div className="flex gap-2">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none"
                                        value={formData.height ? formData.height.split(' ')[0] : ''}
                                        onChange={(e) => {
                                            const unit = formData.height ? formData.height.split(' ')[1] : 'ft';
                                            setFormData({ ...formData, height: `${e.target.value} ${unit}`.trim() });
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
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none"
                                        value={formData.weight ? formData.weight.split(' ')[0] : ''}
                                        onChange={(e) => {
                                            const unit = formData.weight ? formData.weight.split(' ')[1] : 'lbs';
                                            setFormData({ ...formData, weight: `${e.target.value} ${unit}` });
                                        }}
                                    >
                                        <option value="">Select</option>
                                        {[...Array(40)].map((_, i) => {
                                            const val = (i * 5) + 50;
                                            return <option key={val} value={val}>{val}</option>;
                                        })}
                                        {[...Array(20)].map((_, i) => {
                                            const val = (i * 10) + 250;
                                            return <option key={val} value={val}>{val}</option>;
                                        })}
                                    </select>
                                    <select
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-2 focus:outline-none"
                                        value={formData.weight ? formData.weight.split(' ')[1] : 'lbs'}
                                        onChange={(e) => {
                                            const val = formData.weight ? formData.weight.split(' ')[0] : '';
                                            setFormData({ ...formData, weight: `${val} ${e.target.value}` });
                                        }}
                                    >
                                        <option value="lbs">lbs</option>
                                        <option value="kg">kg</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Insurance */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <CreditCard size={20} className="text-teal-600" />
                            Insurance (Optional)
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Provider</label>
                            <input
                                type="text"
                                value={formData.insuranceProvider}
                                onChange={e => setFormData({ ...formData, insuranceProvider: e.target.value })}
                                placeholder="e.g. BlueCross"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-4 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={async () => {
                            setIsSaving(true);
                            try {
                                await onSave(formData);
                            } catch (error) {
                                console.error("Error saving profile:", error);
                                alert("Failed to save profile. Please check your connection and try again.");
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                        disabled={!formData.name || isSaving}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-teal-600/20 transition-all text-lg flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Complete Setup"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InitialSetupForm;
