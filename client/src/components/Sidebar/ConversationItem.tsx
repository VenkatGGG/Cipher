import React from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';

interface ConversationItemProps {
    id: string;
    title: string;
    isActive: boolean;
    isMenuOpen: boolean;
    onClick: () => void;
    onMenuToggle: () => void;
    onDelete: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
    title,
    isActive,
    isMenuOpen,
    onClick,
    onMenuToggle,
    onDelete
}) => {
    return (
        <div
            className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-all ${isActive
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'hover:bg-white/5 border border-transparent'
                }`}
        >
            <div className="flex items-center justify-between gap-2" onClick={onClick}>
                <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${isActive ? 'text-emerald-400 font-medium' : 'text-zinc-400'}`}>
                        {title}
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMenuToggle();
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                >
                    <MoreVertical size={14} className="text-zinc-500" />
                </button>
            </div>
            {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 min-w-[120px]">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                        <Trash2 size={12} /> Delete
                    </button>
                </div>
            )}
        </div>
    );
};
