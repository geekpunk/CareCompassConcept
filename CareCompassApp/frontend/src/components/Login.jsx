import React from 'react';
import { signInWithGoogle } from '../firebase';
import { Heart, ShieldCheck } from 'lucide-react';

const Login = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border border-slate-100">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600">
                    <Heart size={32} fill="currentColor" />
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to CareCompass</h1>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                    Your personal AI health assistant. Secure, private, and always here to help.
                </p>

                <button
                    onClick={signInWithGoogle}
                    className="w-full py-3.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md group"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    <span>Sign in with Google</span>
                </button>

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <ShieldCheck size={14} />
                    <span>Secure & Encrypted</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
