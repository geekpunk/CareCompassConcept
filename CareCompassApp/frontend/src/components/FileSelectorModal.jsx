import React, { useEffect, useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { getFiles } from '../api';

const FileSelectorModal = ({ patientId, onSelect, onClose }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFiles = async () => {
            setLoading(true);
            const data = await getFiles(patientId);
            setFiles(data);
            setLoading(false);
        };
        loadFiles();
    }, [patientId]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
                <header className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Select a File</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X size={20} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8 text-slate-400">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No files found. Upload files in the Files tab first.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {files.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => onSelect(file)}
                                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50 transition-all flex items-center gap-3 group"
                                >
                                    <div className="bg-orange-50 text-orange-600 p-2 rounded-lg group-hover:bg-white group-hover:text-teal-600 transition-colors">
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(parseFloat(file.uploadedAt) * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileSelectorModal;
