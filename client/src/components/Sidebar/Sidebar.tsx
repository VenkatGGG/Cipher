import React from 'react';
import { SidebarRail } from './SidebarRail';
import { HistoryPanel } from './HistoryPanel';

interface Conversation {
    id: string;
    title: string;
}

interface SidebarProps {
    conversations: Conversation[];
    activeId: string | null;
    isHistoryOpen: boolean;
    activeMenuId: string | null;
    onNewChat: () => void;
    onToggleHistory: () => void;
    onConversationClick: (id: string) => void;
    onMenuToggle: (id: string | null) => void;
    onDelete: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    conversations,
    activeId,
    isHistoryOpen,
    activeMenuId,
    onNewChat,
    onToggleHistory,
    onConversationClick,
    onMenuToggle,
    onDelete
}) => {
    return (
        <div className="flex h-full">
            <SidebarRail onNewChat={onNewChat} onToggleHistory={onToggleHistory} />

            <div
                className={`bg-zinc-950/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out ${isHistoryOpen ? 'w-64 md:w-72' : 'w-0'
                    } overflow-hidden flex flex-col`}
            >
                <div className="px-6 py-6 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white tracking-tight">CIPHER</h2>
                    <p className="text-xs text-zinc-500 mt-1">AI Research Assistant</p>
                </div>

                <HistoryPanel
                    conversations={conversations}
                    activeId={activeId}
                    activeMenuId={activeMenuId}
                    onConversationClick={onConversationClick}
                    onMenuToggle={onMenuToggle}
                    onDelete={onDelete}
                />
            </div>
        </div>
    );
};
