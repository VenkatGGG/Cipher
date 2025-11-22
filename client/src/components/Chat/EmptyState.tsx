import React from 'react';
import { Sparkles } from 'lucide-react';

export const EmptyState: React.FC = () => {
    return (
        <div className="layout-empty-state animate-fade-in-up">
            <div className="space-y-6">
                <div className="icon-empty-state">
                    <Sparkles size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-heading-xl">
                    What do you want to <span className="text-emerald-500">know</span>?
                </h2>
                <p className="text-body">
                    Ask anything. I'll search, analyze, and deliver the answer.
                </p>
            </div>
        </div>
    );
};
