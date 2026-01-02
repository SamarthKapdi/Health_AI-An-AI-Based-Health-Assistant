import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Activity, Users, Globe } from 'lucide-react';

const Analytics = () => {
    // Mock Data
    const stats = [
        { label: 'Total Sessions', value: '1,240', icon: <Activity size={24} color="#0ea5e9" />, color: '#e0f2fe' },
        { label: 'Active Users', value: '843', icon: <Users size={24} color="#8b5cf6" />, color: '#ede9fe' },
        { label: 'Communities', value: '12', icon: <Globe size={24} color="#14b8a6" />, color: '#ccfbf1' },
    ];

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1>Admin Analytics</h1>
                <p style={{ marginBottom: '2rem' }}>Insights into campus health trends.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {stats.map((stat) => (
                        <div key={stat.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ background: stat.color, padding: '1rem', borderRadius: '16px' }}>
                                {stat.icon}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stat.value}</h3>
                                <div style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieChart size={20} /> Risk Level Distribution
                    </h3>
                    <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginTop: '1rem', display: 'flex' }}>
                        <div style={{ width: '60%', background: '#22c55e' }} title="Low Risk (60%)"></div>
                        <div style={{ width: '30%', background: '#f59e0b' }} title="Medium Risk (30%)"></div>
                        <div style={{ width: '10%', background: '#ef4444' }} title="High Risk (10%)"></div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 10, height: 10, background: '#22c55e', borderRadius: '50%' }}></div> Low (60%)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 10, height: 10, background: '#f59e0b', borderRadius: '50%' }}></div> Medium (30%)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%' }}></div> High (10%)</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Analytics;
