import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Activity, MessageSquare, AlertTriangle } from 'lucide-react';
import { getSymptomHistory, getChatHistory } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
    const [history, setHistory] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [mentalHistory, setMentalHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        loadHistory();
    }, [currentUser]);

    const loadHistory = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            setError('');
            const [symptoms, chats, mentalChats] = await Promise.all([
                getSymptomHistory(currentUser.uid),
                getChatHistory(currentUser.uid, 'chat'),
                getChatHistory(currentUser.uid, 'mental')
            ]);
            setHistory(symptoms);
            setChatHistory(chats);
            setMentalHistory(mentalChats);
        } catch (error) {
            console.error('Error loading history:', error);
            setError(error?.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateVal) => {
        if (!dateVal) return '';
        const date = dateVal.seconds ? new Date(dateVal.seconds * 1000) : new Date(dateVal);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRiskColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#22c55e';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e2e8f0',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Clock size={32} color="var(--primary)" />
                    <h1 style={{ margin: 0 }}>Health History</h1>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecdd3',
                        color: '#991b1b',
                        padding: '12px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '1rem'
                    }}>
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {history.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <Activity size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3, color: 'var(--text-muted)' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            No symptom analysis history yet
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Start analyzing your symptoms to build your health history
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {history.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="card"
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Activity size={18} color="var(--primary)" />
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                        <h3 style={{ margin: '0 0 0.75rem 0' }}>Symptoms:</h3>
                                        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>
                                            {item.symptoms}
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        background: `${getRiskColor(item.analysis?.riskLevel)}20`,
                                        color: getRiskColor(item.analysis?.riskLevel),
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.analysis?.riskLevel || 'Unknown'} Risk
                                    </div>
                                </div>

                                {item.analysis?.advice && (
                                    <div style={{
                                        background: 'var(--glass-bg)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        marginTop: '1rem'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                            <strong>Advice:</strong> {item.analysis.advice}
                                        </p>
                                    </div>
                                )}

                                {item.analysis?.conditions && item.analysis.conditions.length > 0 && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                            Possible conditions:
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {item.analysis.conditions.map((condition, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        background: 'white',
                                                        border: '1px solid var(--glass-border)',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {condition}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2.5rem 0 1rem' }}>
                    <MessageSquare size={28} color="var(--primary)" />
                    <h2 style={{ margin: 0 }}>Chatbot History</h2>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ({chatHistory.length} messages)
                    </span>
                </div>

                {chatHistory.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                            No chat history yet
                        </p>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {chatHistory.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: msg.role === 'user' ? 'var(--secondary)' : 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    flexShrink: 0
                                }}>
                                    {msg.role === 'user' ? 'U' : 'AI'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{msg.role === 'user' ? 'You' : 'Assistant'}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {formatDate(msg.createdAt || msg.timestamp)}
                                        </span>
                                    </div>
                                    <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                                        {msg.message || msg.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2.5rem 0 1rem' }}>
                    <MessageSquare size={28} color="var(--primary)" />
                    <h2 style={{ margin: 0 }}>Mental Health Bot</h2>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ({mentalHistory.length} messages)
                    </span>
                </div>

                {mentalHistory.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                            No mental health chat history yet
                        </p>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {mentalHistory.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: msg.role === 'user' ? 'var(--secondary)' : 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '0.8rem', flexShrink: 0
                                }}>
                                    {msg.role === 'user' ? 'U' : 'AI'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{msg.role === 'user' ? 'You' : 'Assistant'}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            {formatDate(msg.createdAt || msg.timestamp)}
                                        </span>
                                    </div>
                                    <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                                        {msg.message || msg.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default History;
