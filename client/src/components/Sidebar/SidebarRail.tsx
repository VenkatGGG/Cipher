import React from 'react';
import { Plus, MessageSquare, Command } from 'lucide-react';

interface SidebarRailProps {
    onNewChat: () => void;
    onToggleHistory: () => void;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({ onNewChat, onToggleHistory }) => {
    return (
        <div className="layout-sidebar-rail">
            <div className="icon-brand">
                <Command size={20} className="text-white" />
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <button
                    onClick={onNewChat}
                    className="btn-icon"
                    title="New Chat"
                >
                    <Plus size={20} className="icon-interactive" />
                </button>

                <button
                    onClick={onToggleHistory}
                    className="btn-icon"
                    title="History"
                >
                    <MessageSquare size={20} className="icon-interactive" />
                </button>
            </div>
        </div>
    );
};
