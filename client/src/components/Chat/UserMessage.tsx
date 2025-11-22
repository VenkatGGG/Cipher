import React from 'react';

interface UserMessageProps {
    content: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content }) => {
    // Extract just the query part if it contains "User Query:"
    const displayContent = content.includes('User Query:')
        ? content.split('User Query: ')[1]
        : content;

    return (
        <div className="flex flex-col items-end gap-3 animate-fade-in-up">
            <div className="flex items-start gap-3 max-w-2xl">
                <h3 className="text-heading-lg">
                    {displayContent}
                </h3>
            </div>
        </div>
    );
};
