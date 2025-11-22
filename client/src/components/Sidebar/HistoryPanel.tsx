import React from 'react';
import { ConversationItem } from './ConversationItem';

interface Conversation {
    id: string;
    title: string;
}

interface HistoryPanelProps {
    conversations: Conversation[];
    activeId: string | null;
    activeMenuId: string | null;
    onConversationClick: (id: string) => void;
    onMenuToggle: (id: string | null) => void;
    onDelete: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
    conversations,
    activeId,
    activeMenuId,
    onConversationClick,
    onMenuToggle,
    onDelete
}) => {
    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                Recent Chats
            </div>
            {conversations.map((conv) => (
                <ConversationItem
                    key={conv.id}
                    id={conv.id}
                    title={conv.title}
                    isActive={activeId === conv.id}
                    isMenuOpen={activeMenuId === conv.id}
                    onClick={() => onConversationClick(conv.id)}
                    onMenuToggle={() => onMenuToggle(activeMenuId === conv.id ? null : conv.id)}
                    onDelete={() => onDelete(conv.id)}
                />
            ))}
        </div>
    );
};
