import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Loader2, Send, ImageIcon, FileText, Download, UploadCloud, Trash2 } from 'lucide-react';
import { uploadFile, getFiles, getFileDownloadUrl, deleteFile } from '../api';

const FilesView = ({ onFileAnalyze, patientId }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [previewFile, setPreviewFile] = useState(null); // The actual file object
    const [analyzing, setAnalyzing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(true);

    useEffect(() => {
        loadFiles();
    }, [patientId]);

    const loadFiles = async () => {
        if (!patientId) return;
        setLoadingFiles(true);
        const data = await getFiles(patientId);
        setFiles(data);
        setLoadingFiles(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                // For PDF/Docs, just show a placeholder
                setPreview('PDF_PLACEHOLDER');
            }
        }
    };

    const handleUpload = async () => {
        if (!previewFile || !patientId) return;
        setUploading(true);
        try {
            await uploadFile(patientId, previewFile);
            setPreview(null);
            setPreviewFile(null);
            loadFiles(); // Refresh list
        } catch (error) {
            alert("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!preview) return;
        setAnalyzing(true);

        let base64Data;
        let mimeType = previewFile ? previewFile.type : 'image/jpeg';

        if (preview === 'PDF_PLACEHOLDER' && previewFile) {
            // Convert PDF file to base64
            const reader = new FileReader();
            reader.readAsDataURL(previewFile);
            await new Promise(resolve => reader.onload = resolve);
            base64Data = reader.result.split(',')[1];
        } else {
            base64Data = preview.split(',')[1];
        }

        await onFileAnalyze(base64Data, preview === 'PDF_PLACEHOLDER' ? null : preview, mimeType);
        setAnalyzing(false);
        setPreview(null);
        setPreviewFile(null);
    };

    const handleDownload = async (file) => {
        try {
            const url = await getFileDownloadUrl(patientId, file.id);
            window.open(url, '_blank');
        } catch (error) {
            alert("Failed to download file");
        }
    };

    const handleAnalyzeExisting = async (file) => {
        // Support Image and PDF
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            alert("Only image and PDF analysis is currently supported.");
            return;
        }

        try {
            let previewUrl = null;
            // If it's an image, get the URL for preview
            if (file.type.startsWith('image/')) {
                previewUrl = await getFileDownloadUrl(patientId, file.id);
            }

            // Pass fileId to backend instead of downloading content here
            // We pass 'null' for base64, previewUrl for preview (if image), mimeType, and fileId
            await onFileAnalyze(null, previewUrl, file.type, file.id);
        } catch (e) {
            console.error(e);
            alert("Failed to prepare file for analysis");
        }
    };

    const handleDelete = async (file) => {
        if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;
        try {
            await deleteFile(patientId, file.id);
            loadFiles();
        } catch (error) {
            alert("Failed to delete file");
        }
    };

    return (
        <div className="flex flex-col h-full p-6 pb-24 animate-fade-in">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">My Files</h1>
                <p className="text-slate-500 mt-2">Scan or upload medical documents.</p>
            </header>

            {/* Upload Area */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 relative overflow-hidden group min-h-[300px]">
                {preview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {preview === 'PDF_PLACEHOLDER' ? (
                            <div className="text-center">
                                <FileText size={64} className="text-red-500 mx-auto mb-2" />
                                <p className="font-semibold text-slate-700">{previewFile?.name}</p>
                                <p className="text-xs text-slate-500">PDF Document</p>
                            </div>
                        ) : (
                            <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
                        )}
                        <button
                            onClick={() => { setPreview(null); setPreviewFile(null); }}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-8 pointer-events-none">
                        <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Camera size={40} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Tap to Scan or Upload</h3>
                        <p className="text-slate-400 text-sm mt-2">Supports Images & PDFs</p>
                    </div>
                )}

                {!preview && (
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,application/pdf"
                        capture="environment"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                )}
            </div>

            <div className="mt-6 mb-8 flex gap-3">
                {preview ? (
                    <>
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing || uploading}
                            className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Analyze
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={analyzing || uploading}
                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={20} />
                                    Upload
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                        <ImageIcon size={20} />
                        Select from Gallery / Camera
                    </button>
                )}
            </div>

            {/* Recent Files Section */}
            <div>
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Uploaded Documents</h2>
                <div className="space-y-3">
                    {loadingFiles ? (
                        <div className="text-center py-4 text-slate-400">Loading files...</div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-4 text-slate-400 text-sm">No files uploaded yet.</div>
                    ) : (
                        files.map(file => (
                            <div key={file.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-orange-50 text-orange-600 p-2 rounded-lg shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(parseFloat(file.uploadedAt) * 1000).toLocaleDateString()} • {file.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    {(file.type.startsWith('image/') || file.type === 'application/pdf') && (
                                        <button
                                            onClick={() => handleAnalyzeExisting(file)}
                                            className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                                            title="Analyze"
                                        >
                                            <Send size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilesView;
