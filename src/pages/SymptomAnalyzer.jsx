import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, Volume2 } from 'lucide-react';
import useVoice from '../hooks/useVoice';
import { analyzeSymptoms } from '../services/gemini';
import { saveSymptomAnalysis } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

const SymptomAnalyzer = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [analyzing, setAnalyzing] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const { speak } = useVoice();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (query) {
            analyzeUserSymptoms();
        } else {
            setAnalyzing(false);
        }
    }, [query]);

    const analyzeUserSymptoms = async () => {
        try {
            setAnalyzing(true);
            setError(null);

            // Call Gemini AI to analyze symptoms
            const analysis = await analyzeSymptoms(query);

            setResult({
                risk: analysis.riskLevel,
                advice: analysis.advice,
                urgency: analysis.urgency,
                conditions: analysis.conditions || []
            });

            // Save to Firestore if user is logged in
            if (currentUser) {
                await saveSymptomAnalysis(currentUser.uid, query, analysis);
            }
        } catch (err) {
            console.error('Error analyzing symptoms:', err);
            const msg = err?.message || 'Failed to analyze symptoms. Please check if Gemini API key is configured.';
            setError(msg);

            // Fallback to mock data
            const lowerQ = query.toLowerCase();
            let risk = 'Low';
            if (lowerQ.includes('chest') || lowerQ.includes('pain') || lowerQ.includes('breath')) risk = 'High';
            else if (lowerQ.includes('fever') && lowerQ.includes('high')) risk = 'Medium';

            setResult({
                risk,
                advice: risk === 'High' ? "Please visit a doctor immediately. This could be serious." :
                    risk === 'Medium' ? "Monitor your symptoms closely. Hydrate and rest." :
                        "Likely a minor issue. Get some rest.",
                conditions: ["Common Cold", "Flu", "Fatigue"],
                urgency: "Consult a healthcare professional"
            });
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card"
                style={{ maxWidth: '800px', margin: '0 auto' }}
            >
                <h2 style={{ marginBottom: '1.5rem' }}>Symptom Analysis</h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Symptoms: <strong>{query}</strong></p>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '1.5rem',
                        color: '#991b1b'
                    }}>
                        {error}
                    </div>
                )}

                {analyzing ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="spinner" style={{
                            width: '40px', height: '40px', border: '4px solid #e2e8f0',
                            borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p>Analyzing with AI...</p>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : result && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div style={{
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: result.risk === 'High' ? '#fef2f2' : result.risk === 'Medium' ? '#fffbeb' : '#f0fdf4',
                            border: `1px solid ${result.risk === 'High' ? '#ef4444' : result.risk === 'Medium' ? '#f59e0b' : '#22c55e'}`,
                            display: 'flex',
                            alignItems: 'start',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            {result.risk === 'High' ? <AlertTriangle color="#ef4444" size={32} /> :
                                result.risk === 'Medium' ? <Info color="#f59e0b" size={32} /> :
                                    <CheckCircle color="#22c55e" size={32} />}
                            <div>
                                <h3 style={{ margin: 0, color: result.risk === 'High' ? '#ef4444' : result.risk === 'Medium' ? '#f59e0b' : '#22c55e' }}>
                                    Risk Level: {result.risk}
                                </h3>
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-main)' }}>{result.advice}</p>
                                <button onClick={() => speak(`Risk Level ${result.risk}. ${result.advice}`)}
                                    style={{ background: 'transparent', border: '1px solid currentColor', borderRadius: '20px', padding: '4px 12px', marginTop: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'inherit' }}>
                                    <Volume2 size={14} /> Read Aloud
                                </button>
                            </div>
                        </div>

                        <h3>Possible Causes</h3>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                            {result.conditions.map(c => (
                                <li key={c} style={{
                                    padding: '1rem',
                                    borderBottom: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}>
                                    <span>{c}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Match: 85%</span>
                                </li>
                            ))}
                        </ul>

                        <div style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <strong>Disclaimer:</strong> This is an AI-generated analysis and not a medical diagnosis. Please consult a doctor for accurate advice.
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={() => window.location.href = '/emergency'}>Find Nearby Doctors</button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default SymptomAnalyzer;
