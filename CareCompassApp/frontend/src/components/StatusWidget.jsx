import React from 'react';
import { FileText, Activity, Clock } from 'lucide-react';

const StatusWidget = ({ lastUpdate }) => {
    const getStatusText = () => {
        if (!lastUpdate) return "No context updates yet";
        const time = new Date(lastUpdate.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (lastUpdate.type === 'vitals') return `Vitals updated today at ${time}`;
        if (lastUpdate.type === 'scan') return `Document scanned today at ${time}`;
        return "Context up to date";
    };

    return (
        <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-xl p-4 flex items-center justify-between shadow-sm border border-teal-100/50">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full text-teal-600 shadow-sm">
                    {lastUpdate?.type === 'scan' ? <FileText size={18} /> : <Activity size={18} />}
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Health Context</p>
                    <p className="text-sm font-medium text-slate-800">{getStatusText()}</p>
                </div>
            </div>
            {lastUpdate && <div className="text-teal-600"><Clock size={16} /></div>}
        </div>
    );
};

export default StatusWidget;
