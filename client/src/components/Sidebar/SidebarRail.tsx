import React from 'react';
import { Plus, MessageSquare, Command } from 'lucide-react';

interface SidebarRailProps {
    onNewChat: () => void;
    onToggleHistory: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({ onNewChat, onToggleHistory }) => {
    return (
        <div className="w-16 md:w-20 bg-zinc-950 border-r border-white/5 flex flex-col items-center py-6 gap-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Command size={20} className="text-white" />
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <button
                    onClick={onNewChat}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 group"
                    title="New Chat"
                >
                    <Plus size={20} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </button>

                <button
                    onClick={onToggleHistory}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 group"
                    title="History"
                >
                    <MessageSquare size={20} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </button>
            </div>
        </div>
    );
};
