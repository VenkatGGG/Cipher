import React from 'react';
import { Sparkles } from 'lucide-react';

export const EmptyState: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in-up">
            <div className="space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
                    <Sparkles size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                    What do you want to <span className="text-emerald-500">know</span>?
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl font-light max-w-md mx-auto">
                    Ask anything. I'll search, analyze, and deliver the answer.
                </p>
            </div>
        </div>
    );
};
