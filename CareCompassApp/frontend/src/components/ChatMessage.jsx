import React from 'react';
import { User, Bot, Info, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message, onInfoClick, fontSize = 15 }) => {
    const isUser = message.sender === 'user';

    return (
        <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-indigo-600 text-white' : 'bg-teal-600 text-white'}`}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div
                    className={`p-4 rounded-2xl shadow-sm leading-relaxed ${isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                        }`}
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {message.image && (
                        <img src={message.image} alt="Uploaded content" className="max-w-full rounded-lg mb-3 border border-white/20" />
                    )}
                    {message.attachment && (
                        <div className={`mb-3 flex items-center gap-2 p-2 rounded-lg border ${isUser ? 'bg-indigo-700 border-indigo-500 text-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                            <div className={`p-1 rounded ${isUser ? 'bg-indigo-600' : 'bg-white'}`}>
                                <FileText size={14} />
                            </div>
                            <span className="text-xs font-medium truncate max-w-[200px]">{message.attachment.name}</span>
                        </div>
                    )}

                    {isUser ? (
                        <div className="whitespace-pre-wrap">{message.text}</div>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="" {...props} />,
                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1 mt-2" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-teal-200 pl-3 italic my-2 text-slate-500" {...props} />,
                                code: ({ node, inline, ...props }) =>
                                    inline
                                        ? <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-pink-600" {...props} />
                                        : <div className="bg-slate-800 text-slate-200 p-3 rounded-lg my-2 overflow-x-auto text-xs font-mono"><code {...props} /></div>,
                                table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg" {...props} /></div>,
                                th: ({ node, ...props }) => <th className="px-3 py-2 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" {...props} />,
                                td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-500 border-t border-slate-100" {...props} />,
                                a: ({ node, ...props }) => <a className="text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                            }}
                        >
                            {message.text}
                        </ReactMarkdown>
                    )}
                </div>
                {isUser && message.debugInfo && (
                    <button
                        onClick={() => onInfoClick(message.debugInfo)}
                        className="mt-1 text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                    >
                        <Info size={12} /> Debug Context
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
