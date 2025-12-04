import React, { useState } from 'react';
import { Stethoscope, Pill, User, Phone, Edit2, Trash2, Plus, X } from 'lucide-react';

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

        let itemToSave = { ...formData };
        if (subTab === 'meds') {
            if (itemToSave.dosage === 'Other') itemToSave.dosage = itemToSave.customDosage;
            if (itemToSave.frequency === 'Other') itemToSave.frequency = itemToSave.customFrequency;
            delete itemToSave.customDosage;
            delete itemToSave.customFrequency;
        }

        let newList;

        if (editingItem) {
            // Update existing
            newList = currentList.map(item => item.id === editingItem.id ? { ...itemToSave, id: editingItem.id } : item);
        } else {
            // Add new
            newList = [...currentList, { ...itemToSave, id: Date.now().toString() }];
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
                                            list="drug-names"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                            autoFocus
                                        />
                                        <datalist id="drug-names">
                                            <option value="Lisinopril" />
                                            <option value="Metformin" />
                                            <option value="Atorvastatin" />
                                            <option value="Amlodipine" />
                                            <option value="Metoprolol" />
                                            <option value="Omeprazole" />
                                            <option value="Losartan" />
                                            <option value="Albuterol" />
                                            <option value="Gabapentin" />
                                            <option value="Hydrochlorothiazide" />
                                            <option value="Levothyroxine" />
                                            <option value="Simvastatin" />
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dosage</label>
                                        {formData.dosage === 'Other' ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={formData.customDosage || ''}
                                                    onChange={e => setFormData({ ...formData, customDosage: e.target.value })}
                                                    placeholder="Enter dosage"
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => setFormData({ ...formData, dosage: '', customDosage: '' })}
                                                    className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <select
                                                value={formData.dosage || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === 'Other') {
                                                        setFormData({ ...formData, dosage: 'Other', customDosage: '' });
                                                    } else {
                                                        setFormData({ ...formData, dosage: val });
                                                    }
                                                }}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none"
                                            >
                                                <option value="">Select Dosage</option>
                                                <option value="5mg">5mg</option>
                                                <option value="10mg">10mg</option>
                                                <option value="20mg">20mg</option>
                                                <option value="25mg">25mg</option>
                                                <option value="40mg">40mg</option>
                                                <option value="50mg">50mg</option>
                                                <option value="100mg">100mg</option>
                                                <option value="500mg">500mg</option>
                                                <option value="850mg">850mg</option>
                                                <option value="1000mg">1000mg</option>
                                                <option value="Other">Other...</option>
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Frequency</label>
                                        {formData.frequency === 'Other' ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={formData.customFrequency || ''}
                                                    onChange={e => setFormData({ ...formData, customFrequency: e.target.value })}
                                                    placeholder="Enter frequency"
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => setFormData({ ...formData, frequency: '', customFrequency: '' })}
                                                    className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <select
                                                value={formData.frequency || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === 'Other') {
                                                        setFormData({ ...formData, frequency: 'Other', customFrequency: '' });
                                                    } else {
                                                        setFormData({ ...formData, frequency: val });
                                                    }
                                                }}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none"
                                            >
                                                <option value="">Select Frequency</option>
                                                <option value="Once daily">Once daily</option>
                                                <option value="Twice daily">Twice daily</option>
                                                <option value="Three times daily">Three times daily</option>
                                                <option value="Every 4 hours">Every 4 hours</option>
                                                <option value="Every 6 hours">Every 6 hours</option>
                                                <option value="Every 8 hours">Every 8 hours</option>
                                                <option value="Every 12 hours">Every 12 hours</option>
                                                <option value="As needed">As needed</option>
                                                <option value="Before meals">Before meals</option>
                                                <option value="At bedtime">At bedtime</option>
                                                <option value="Other">Other...</option>
                                            </select>
                                        )}
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

export default DocsMedsSection;
