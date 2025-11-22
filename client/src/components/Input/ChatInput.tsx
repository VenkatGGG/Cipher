import React, { useRef, useEffect } from 'react';
import { Send, Zap, Paperclip } from 'lucide-react';

interface ChatInputProps {
    input: string;
    isStreaming: boolean;
    onInputChange: (value: string) => void;
    onSubmit: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    input,
    isStreaming,
    onInputChange,
    onSubmit,
    onKeyDown
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/98 to-transparent pt-32 md:pt-40 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
                <div className={`relative group transition-all duration-300 ${input.trim() ? 'input-island-active' : 'input-island'}`}>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Ask anything..."
                        className="w-full bg-transparent py-5 pl-6 pr-14 text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none min-h-[60px] max-h-[200px] font-medium text-[15px] leading-relaxed"
                        rows={1}
                        disabled={isStreaming}
                    />

                    <div className="flex items-center justify-between px-4 pb-3">
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold border border-transparent hover:border-white/10 hover:shadow-sm active:scale-95">
                                <Zap size={14} className="text-emerald-500" /> Focus
                            </button>
                            <button className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold border border-transparent hover:border-white/10 hover:shadow-sm active:scale-95">
                                <Paperclip size={14} /> Attach
                            </button>
                        </div>

                        <button
                            onClick={onSubmit}
                            disabled={!input.trim() || isStreaming}
                            className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:cursor-not-allowed rounded-xl transition-all hover:scale-105 active:scale-95 disabled:scale-100 shadow-lg shadow-emerald-500/20 disabled:shadow-none"
                        >
                            <Send size={18} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
