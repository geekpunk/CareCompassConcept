import React, { useState } from 'react';
import { Heart, Database, ShieldCheck, ArrowRight } from 'lucide-react';

const OnboardingModal = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: <Heart size={48} className="text-teal-600" fill="currentColor" />,
            title: "Welcome to CareCompass",
            description: "Your personal health companion. I'm here to help you understand your health conditions, explain medical notes, and answer your care questions simply and clearly."
        },
        {
            icon: <Database size={48} className="text-indigo-600" />,
            title: "Better Context, Better Care",
            description: "The more details you add to 'Docs & Meds' and your 'My Health' profile, the smarter I become. Sharing your vitals and history helps me give you personalized answers."
        },
        {
            icon: <ShieldCheck size={48} className="text-teal-600" />,
            title: "You Are In Control",
            description: "This is an open source project designed to empower you. Remember, you are in charge of your health decisions. I am an AI support tool, not a doctor."
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-teal-600' : 'w-2 bg-slate-200'}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="mb-8 p-6 bg-slate-50 rounded-full shadow-sm animate-in zoom-in duration-500">
                        {steps[step].icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{steps[step].title}</h2>
                    <p className="text-slate-500 leading-relaxed">
                        {steps[step].description}
                    </p>
                </div>

                {/* Actions */}
                <button
                    onClick={handleNext}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white rounded-2xl font-bold shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
                >
                    {step === steps.length - 1 ? "Get Started" : "Next"}
                    {step !== steps.length - 1 && <ArrowRight size={20} />}
                </button>

                {step < steps.length - 1 && (
                    <button
                        onClick={onComplete}
                        className="text-slate-400 text-sm font-medium hover:text-slate-600"
                    >
                        Skip Intro
                    </button>
                )}
            </div>
        </div>
    );
};

export default OnboardingModal;
