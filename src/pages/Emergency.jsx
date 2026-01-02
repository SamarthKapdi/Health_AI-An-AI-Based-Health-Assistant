import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, AlertOctagon, Share2 } from 'lucide-react';

const Emergency = () => {
    const [alertSent, setAlertSent] = useState(false);

    const handleSOS = () => {
        setAlertSent(true);
        // Simulate API call
        setTimeout(() => {
            alert("Emergency Alert Sent to Contacts and Local Authorities!");
        }, 1000);
    };

    return (
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center' }}>
            <h1>Emergency Assistance</h1>
            <p>Quick action can save lives.</p>

            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSOS}
                style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 30px rgba(220, 38, 38, 0.5)',
                    cursor: 'pointer',
                    margin: '3rem auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    animation: 'pulse-red 2s infinite'
                }}
            >
                <AlertOctagon size={48} />
                {alertSent ? "SENT!" : "SOS"}
            </motion.button>

            {alertSent && (
                <div style={{ padding: '1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '2rem', display: 'inline-block' }}>
                    Alert sent to 3 Emergency Contacts & Local EMS
                </div>
            )}

            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin /> Nearby Healthcare
                </h2>

                <div className="card" style={{ marginBottom: '2rem', height: '300px', overflow: 'hidden', padding: 0 }}>
                    {/* Embedding Google Maps for Hospitals */}
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src="https://maps.google.com/maps?q=hospitals+near+me&t=&z=13&ie=UTF8&iwloc=&output=embed"
                        title="Maps"
                    ></iframe>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div className="card">
                        <h3>City General Hospital</h3>
                        <p>1.2 km away • Open 24/7</p>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}><Phone size={16} /> Call Now</button>
                    </div>
                    <div className="card">
                        <h3>Sunrise Clinic</h3>
                        <p>0.5 km away • Closes 9 PM</p>
                        <button className="btn" style={{ width: '100%', marginTop: '1rem', border: '1px solid #ddd' }}><Phone size={16} /> Call Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Emergency;
