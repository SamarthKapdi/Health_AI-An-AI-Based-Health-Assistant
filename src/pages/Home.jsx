import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, Search, Thermometer, Brain, Wind, Zap, Activity } from 'lucide-react';
import useVoice from '../hooks/useVoice';

const Home = () => {
    const [input, setInput] = useState('');
    const navigate = useNavigate();
    const { isListening, transcript, startListening, supported } = useVoice();

    // Update input when voice transcript flows in
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (input.trim()) {
            navigate(`/symptoms?q=${encodeURIComponent(input)}`);
        }
    };

    const quickSymptoms = [
        { icon: <Thermometer size={20} />, label: "Fever", color: "#fca5a5" },
        { icon: <Brain size={20} />, label: "Headache", color: "#fdba74" },
        { icon: <Wind size={20} />, label: "Cough", color: "#a5f3fc" },
        { icon: <Activity size={20} />, label: "Chest Pain", color: "#f87171" },
    ];

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
            >
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Your AI Health Companion
                </h1>
                <p style={{ fontSize: '1.25rem', marginBottom: '3rem', color: 'var(--text-muted)' }}>
                    Describe your symptoms, analyze risks, and get instant guidance. <br />
                    Private, secure, and always here for you.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: '600px', margin: '0 auto 4rem' }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '999px',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: isListening ? '2px solid var(--primary)' : '2px solid transparent',
                        transition: 'all 0.3s'
                    }}>
                        <Search size={24} color="var(--primary)" style={{ marginLeft: '1rem' }} />
                        <input
                            type="text"
                            placeholder={isListening ? "Listening..." : "Ex: I have a high fever and headache..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '1.1rem',
                                flex: 1,
                                color: 'var(--text-main)',
                                fontFamily: 'inherit'
                            }}
                        />
                        <button type="button"
                            style={{
                                background: isListening ? '#ef4444' : 'var(--primary)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                animation: isListening ? 'pulse-red 1.5s infinite' : 'none'
                            }}
                            className="mic-btn"
                            onClick={startListening}
                            title={supported ? "Tap to Speak" : "Voice not supported in this browser"}
                        >
                            <Mic size={24} />
                        </button>
                    </div>
                </form>

                {/* Quick Access */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                    {quickSymptoms.map((symptom, idx) => (
                        <motion.button
                            key={symptom.label}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(`/symptoms?q=${symptom.label}`)}
                            style={{
                                background: 'rgba(255,255,255,0.6)',
                                border: '1px solid white',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                            }}
                        >
                            <div style={{
                                background: symptom.color,
                                padding: '10px',
                                borderRadius: '12px',
                                color: 'var(--text-main)',
                                opacity: 0.9
                            }}>
                                {symptom.icon}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{symptom.label}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
