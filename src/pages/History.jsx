import React from 'react';

const History = () => {
    const historyData = [
        { date: '2025-12-25', symptom: 'Headache', risk: 'Low' },
        { date: '2025-12-20', symptom: 'Fever', risk: 'Medium' },
    ];

    return (
        <div className="container" style={{ paddingTop: '8rem' }}>
            <h1>Health History</h1>
            <div className="card" style={{ marginTop: '2rem' }}>
                {historyData.map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '1rem',
                        borderBottom: idx !== historyData.length - 1 ? '1px solid #eee' : 'none'
                    }}>
                        <div>
                            <strong>{item.symptom}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.date}</div>
                        </div>
                        <span style={{
                            color: item.risk === 'Medium' ? 'orange' : 'green',
                            fontWeight: 600
                        }}>{item.risk} Risk</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
