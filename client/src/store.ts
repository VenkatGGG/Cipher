import { configureStore, createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface Conversation {
    id: string;
    title: string;
    timestamp: number;
}

interface ChatState {
    conversations: Record<string, Message[]>;
    conversationList: Conversation[];
    activeId: string | null;
    loading: boolean;
}

// Async Thunks
export const fetchConversations = createAsyncThunk(
    'chat/fetchConversations',
    async () => {
        const response = await fetch('http://localhost:8000/conversations');
        return (await response.json()) as Conversation[];
    }
);

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (id: string) => {
    const response = await fetch(`http://localhost:8000/conversations/${id}`);
    const data = await response.json();
    return { id, messages: data };
});

export const deleteConversation = createAsyncThunk('chat/deleteConversation', async (id: string) => {
    await fetch(`http://localhost:8000/conversations/${id}`, { method: 'DELETE' });
    return id;
});

const chatSlice = createSlice({
    name: 'chat',
    initialState: { conversations: {}, conversationList: [], activeId: null, loading: false } as ChatState,
    reducers: {
        setActiveId: (state, action: PayloadAction<string>) => {
            state.activeId = action.payload;
        },
        addMessage: (state, action: PayloadAction<{ id: string; message: Message }>) => {
            const { id, message } = action.payload;
            if (!state.conversations[id]) {
                state.conversations[id] = [];
            }
            state.conversations[id].push(message);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.conversationList = action.payload;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.conversations[action.payload.id] = action.payload.messages;
            })
            .addCase(deleteConversation.fulfilled, (state, action) => {
                state.conversationList = state.conversationList.filter(c => c.id !== action.payload);
                delete state.conversations[action.payload];
                if (state.activeId === action.payload) {
                    state.activeId = null;
                }
            });
    },
});

export const { setActiveId, addMessage } = chatSlice.actions;

export const store = configureStore({
    reducer: {
        chat: chatSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
