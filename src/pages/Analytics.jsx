import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Activity, MessageSquare, TrendingUp, Calendar, AlertTriangle, Heart, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserAnalytics } from '../services/analyticsService';

const Analytics = () => {
    const { currentUser } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser) {
            loadAnalytics();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getUserAnalytics(currentUser.uid);
            setAnalytics(data);
        } catch (err) {
            console.error('Error loading analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
                <h1>Your Health Analytics</h1>
                <div className="card" style={{ padding: '3rem' }}>
                    <Activity size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
                    <p>Please log in to view your health analytics.</p>
                </div>
            </div>
        );
    }

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

    const stats = [
        {
            label: 'Symptom Analyses',
            value: analytics?.totalSessions || 0,
            icon: <Activity size={24} color="#0ea5e9" />,
            color: '#e0f2fe',
            description: 'Total symptom checks'
        },
        {
            label: 'Chat Interactions',
            value: analytics?.totalChats || 0,
            icon: <MessageSquare size={24} color="#8b5cf6" />,
            color: '#ede9fe',
            description: 'AI conversations'
        },
        {
            label: 'This Week',
            value: (analytics?.weeklyActivity?.symptoms || 0) + (analytics?.weeklyActivity?.chats || 0),
            icon: <Calendar size={24} color="#14b8a6" />,
            color: '#ccfbf1',
            description: 'Recent activity'
        },
    ];

    const riskDist = analytics?.riskDistribution || { low: 0, medium: 0, high: 0 };
    const hasRiskData = riskDist.low > 0 || riskDist.medium > 0 || riskDist.high > 0;

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ margin: 0 }}>Your Health Analytics</h1>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>
                            Personalized insights based on your activity
                        </p>
                    </div>
                    <button
                        onClick={loadAnalytics}
                        className="btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
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

                {!analytics?.hasData ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <Heart size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3, color: 'var(--primary)' }} />
                        <h3>No Activity Yet</h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                            Start using the symptom analyzer or chatbot to see your personalized health analytics here.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    className="card"
                                    style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div style={{ background: stat.color, padding: '1rem', borderRadius: '16px' }}>
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.75rem' }}>{stat.value}</h3>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat.label}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{stat.description}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Risk Distribution */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <PieChart size={20} />
                                Risk Level Distribution
                            </h3>
                            {hasRiskData ? (
                                <>
                                    <div style={{ height: '24px', background: 'var(--glass-bg)', borderRadius: '99px', overflow: 'hidden', display: 'flex' }}>
                                        {riskDist.low > 0 && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${riskDist.low}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)' }}
                                                title={`Low Risk (${riskDist.low}%)`}
                                            />
                                        )}
                                        {riskDist.medium > 0 && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${riskDist.medium}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                                style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
                                                title={`Medium Risk (${riskDist.medium}%)`}
                                            />
                                        )}
                                        {riskDist.high > 0 && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${riskDist.high}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                                                style={{ background: 'linear-gradient(90deg, #ef4444, #f87171)' }}
                                                title={`High Risk (${riskDist.high}%)`}
                                            />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 12, height: 12, background: '#22c55e', borderRadius: '50%' }} />
                                            Low Risk ({riskDist.low}%)
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: '50%' }} />
                                            Medium Risk ({riskDist.medium}%)
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: '50%' }} />
                                            High Risk ({riskDist.high}%)
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>
                                    No risk assessments yet. Use the symptom analyzer to see your risk distribution.
                                </p>
                            )}
                        </div>

                        {/* Activity Timeline */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <TrendingUp size={20} />
                                Weekly Activity
                            </h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '120px' }}>
                                {analytics?.activityTimeline?.map((day, idx) => {
                                    const total = day.symptoms + day.chats;
                                    const maxHeight = Math.max(...(analytics.activityTimeline.map(d => d.symptoms + d.chats)), 1);
                                    const height = total > 0 ? Math.max((total / maxHeight) * 100, 10) : 5;

                                    return (
                                        <motion.div
                                            key={day.date}
                                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: `${height}px`,
                                                    background: total > 0
                                                        ? 'linear-gradient(180deg, var(--primary), var(--secondary))'
                                                        : 'var(--glass-bg)',
                                                    borderRadius: '8px 8px 4px 4px',
                                                    minHeight: '5px',
                                                    position: 'relative'
                                                }}
                                                title={`${day.symptoms} analyses, ${day.chats} chats`}
                                            >
                                                {total > 0 && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '-20px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        color: 'var(--text-main)'
                                                    }}>
                                                        {total}
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{day.day}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Top Conditions */}
                        {analytics?.topConditions?.length > 0 && (
                            <div className="card">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <Activity size={20} />
                                    Most Analyzed Conditions
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {analytics.topConditions.map((item, idx) => (
                                        <motion.div
                                            key={item.condition}
                                            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <span style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'var(--primary)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {idx + 1}
                                            </span>
                                            <span style={{ flex: 1 }}>{item.condition}</span>
                                            <span style={{
                                                background: 'var(--glass-bg)',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                color: 'var(--text-muted)'
                                            }}>
                                                {item.count} {item.count === 1 ? 'time' : 'times'}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default Analytics;
