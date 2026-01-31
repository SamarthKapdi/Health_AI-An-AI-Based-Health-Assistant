import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Wind, Loader2 } from 'lucide-react';
import { chatWithAI } from '../services/gemini';
import { saveChatMessage, getChatHistory } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

const MentalHealth = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm your supportive friend. How are you feeling right now? Stressed? Anxious? Or just need to chat?", sender: 'ai', createdAt: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const [showBreathing, setShowBreathing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const listRef = useRef(null);

    useEffect(() => {
        if (currentUser) {
            loadHistory();
        }
    }, [currentUser]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const loadHistory = async () => {
        try {
            setError('');
            const chats = await getChatHistory(currentUser.uid, 'mental');
            if (chats.length) {
                setMessages(chats.map(c => ({
                    id: c.id,
                    text: c.message || c.content,
                    sender: c.role === 'assistant' ? 'ai' : 'user',
                    createdAt: c.createdAt || c.timestamp
                })));
            }
        } catch (err) {
            console.error('Mental health history load error', err);
            setError('Could not load past chats.');
        }
    };

    const supportiveSystemContext = `You are a compassionate mental health support bot. Be brief, warm, non-judgmental, and avoid medical diagnoses. Offer grounding or breathing tips when appropriate. Keep responses under 70 words.`;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { id: Date.now(), text: input.trim(), sender: 'user', createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            if (currentUser) {
                await saveChatMessage(currentUser.uid, userMsg.text, 'user', 'mental');
            }

            const historyForAI = messages.map(m => ({ role: m.sender === 'ai' ? 'assistant' : 'user', content: m.text }));
            const aiText = await chatWithAI(`${supportiveSystemContext}\nUser: ${userMsg.text}`, historyForAI);

            const aiMsg = { id: Date.now() + 1, text: aiText, sender: 'ai', createdAt: new Date().toISOString() };
            setMessages(prev => [...prev, aiMsg]);

            if (currentUser) {
                await saveChatMessage(currentUser.uid, aiMsg.text, 'assistant', 'mental');
            }
        } catch (err) {
            console.error('Mental health chat error', err);
            setError(err?.message || 'Failed to get response.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Mental Wellness</h2>
                <button className="btn" style={{ background: '#a5f3fc', color: '#0891b2' }} onClick={() => setShowBreathing(!showBreathing)}>
                    <Wind size={18} /> Breathing Exercise
                </button>
            </div>

            {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}

            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                {error && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecdd3', color: '#991b1b',
                        padding: '10px 12px', margin: '10px', borderRadius: '10px', fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            background: msg.sender === 'user' ? 'var(--primary)' : 'var(--glass-bg)',
                            color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                            padding: '1rem',
                            borderRadius: '20px',
                            borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
                            borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '20px',
                            border: msg.sender === 'ai' ? '1px solid var(--glass-border)' : 'none'
                        }}>
                            {msg.text}
                        </div>
                    ))}
                    {loading && (
                        <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                            <Loader2 size={18} className="spin" />
                            <span>Thinking...</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} style={{ padding: '1rem', background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Type your feelings..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '99px', border: '1px solid var(--glass-border)', outline: 'none' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', borderRadius: '50%' }}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

const BreathingExercise = ({ onClose }) => (
    <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255,255,255,0.9)', zIndex: 2000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}
    >
        <h2 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Breathe In... Breathe Out...</h2>
        <div className="breathing-circle" style={{
            width: '200px', height: '200px', background: 'var(--accent)', borderRadius: '50%', opacity: 0.5,
            animation: 'breathe 4s ease-in-out infinite'
        }}></div>
        <style>{`
      @keyframes breathe {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.5); opacity: 0.8; }
      }
    `}</style>
        <button className="btn" style={{ marginTop: '3rem', border: '1px solid #ccc' }} onClick={onClose}>Close</button>
    </motion.div>
);

export default MentalHealth;
