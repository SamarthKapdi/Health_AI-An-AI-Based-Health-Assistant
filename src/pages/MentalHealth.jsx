import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile, Wind } from 'lucide-react';

const MentalHealth = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm your supportive friend. How are you feeling right now? Stressed? Anxious? Or just need to chat?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [showBreathing, setShowBreathing] = useState(false);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        setInput('');

        // Mock AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I hear you. It's completely okay to feel that way. Have you tried taking a moment to just breathe?",
                sender: 'ai'
            }]);
        }, 1500);
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
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            background: msg.sender === 'user' ? 'var(--primary)' : '#f1f5f9',
                            color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                            padding: '1rem',
                            borderRadius: '20px',
                            borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
                            borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '20px',
                        }}>
                            {msg.text}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSend} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Type your feelings..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '99px', border: '1px solid #e2e8f0', outline: 'none' }}
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
