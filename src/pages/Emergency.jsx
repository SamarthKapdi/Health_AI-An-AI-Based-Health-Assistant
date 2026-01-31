import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, AlertOctagon, Navigation, Clock, ExternalLink, RefreshCw, Loader, MapPinOff } from 'lucide-react';
import { getCurrentLocation, fetchNearbyHospitals, getDirectionsUrl, getMapEmbedUrl, getFallbackHospitals } from '../services/hospitalService';

const Emergency = () => {
    const [alertSent, setAlertSent] = useState(false);
    const [location, setLocation] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState('');
    const [mapUrl, setMapUrl] = useState('https://maps.google.com/maps?q=hospitals+near+me&t=&z=13&ie=UTF8&iwloc=&output=embed');

    useEffect(() => {
        fetchLocationAndHospitals();
    }, []);

    const fetchLocationAndHospitals = async () => {
        setLoading(true);
        setLocationError('');

        try {
            // Get user's location
            const loc = await getCurrentLocation();
            setLocation(loc);

            // Update map to user's location
            setMapUrl(getMapEmbedUrl(loc.lat, loc.lng));

            // Fetch nearby hospitals
            try {
                const nearbyHospitals = await fetchNearbyHospitals(loc.lat, loc.lng, 10000);
                if (nearbyHospitals.length > 0) {
                    setHospitals(nearbyHospitals);
                } else {
                    // No hospitals found, use fallback
                    setHospitals(getFallbackHospitals(loc.lat, loc.lng));
                    setLocationError('No hospitals found nearby. Try increasing search radius.');
                }
            } catch (apiError) {
                console.error('API Error:', apiError);
                setHospitals(getFallbackHospitals(loc.lat, loc.lng));
                setLocationError('Could not fetch hospital data. Showing emergency contacts.');
            }
        } catch (error) {
            console.error('Location error:', error);
            let errorMessage = 'Could not get your location. ';

            switch (error.code) {
                case 1:
                    errorMessage += 'Please enable location permissions in your browser settings.';
                    break;
                case 2:
                    errorMessage += 'Location unavailable. Try again or search manually.';
                    break;
                case 3:
                    errorMessage += 'Location request timed out. Try again.';
                    break;
                default:
                    errorMessage += error.message || 'Please enable location services.';
            }

            setLocationError(errorMessage);
            setHospitals([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSOS = () => {
        setAlertSent(true);
        // In production, this would send alerts to emergency contacts
        setTimeout(() => {
            alert("Emergency Alert Sent to Contacts and Local Authorities!");
        }, 1000);
    };

    const handleCall = (phone) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        }
    };

    const handleDirections = (hospital) => {
        const url = getDirectionsUrl(hospital.lat, hospital.lng, hospital.name);
        window.open(url, '_blank');
    };

    const getStatusBadge = (hospital) => {
        if (hospital.emergency) {
            return (
                <span style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626', animation: 'pulse-red 2s infinite' }} />
                    Emergency
                </span>
            );
        }
        if (hospital.isOpen === true) {
            return (
                <span style={{
                    background: '#dcfce7',
                    color: '#16a34a',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                }}>
                    Open Now
                </span>
            );
        }
        if (hospital.isOpen === false) {
            return (
                <span style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                }}>
                    Closed
                </span>
            );
        }
        return null;
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
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem',
                        background: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        display: 'inline-block'
                    }}
                >
                    Alert sent to 3 Emergency Contacts & Local EMS
                </motion.div>
            )}

            {/* Quick Emergency Numbers */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <button
                    onClick={() => handleCall('112')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Phone size={18} /> Emergency (112)
                </button>
                <button
                    onClick={() => handleCall('108')}
                    className="btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                >
                    <Phone size={18} /> Ambulance (108)
                </button>
                <button
                    onClick={() => handleCall('102')}
                    className="btn"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #8b5cf6', color: '#8b5cf6' }}
                >
                    <Phone size={18} /> Women Helpline (102)
                </button>
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <MapPin /> Nearby Healthcare
                    </h2>
                    <button
                        onClick={fetchLocationAndHospitals}
                        className="btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem'
                        }}
                        disabled={loading}
                    >
                        {loading ? <Loader size={16} className="spin" /> : <RefreshCw size={16} />}
                        Refresh
                    </button>
                </div>

                {locationError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            background: '#fef3c7',
                            border: '1px solid #fcd34d',
                            color: '#92400e',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '1rem'
                        }}
                    >
                        <MapPinOff size={18} />
                        <span>{locationError}</span>
                    </motion.div>
                )}

                {/* Map */}
                <div className="card" style={{ marginBottom: '2rem', height: '300px', overflow: 'hidden', padding: 0 }}>
                    <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        marginHeight="0"
                        marginWidth="0"
                        src={mapUrl}
                        title="Nearby Hospitals Map"
                        style={{ borderRadius: '12px' }}
                    ></iframe>
                </div>

                {/* Hospital Cards */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div className="spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #e2e8f0',
                            borderTopColor: 'var(--primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                    </div>
                ) : hospitals.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {hospitals.map((hospital, idx) => (
                            <motion.div
                                key={hospital.id}
                                className="card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', flex: 1 }}>{hospital.name}</h3>
                                    {getStatusBadge(hospital)}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Navigation size={14} />
                                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{hospital.distanceText}</span>
                                        {!hospital.isFallback && <span>away</span>}
                                    </div>

                                    {hospital.address && hospital.address !== 'Address not available' && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                            <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <span>{hospital.address}</span>
                                        </div>
                                    )}

                                    {hospital.openingHours && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Clock size={14} />
                                            <span>{hospital.openingHours}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                    {hospital.phone && !hospital.isFallback ? (
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            onClick={() => handleCall(hospital.phone)}
                                        >
                                            <Phone size={16} /> Call
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                            onClick={() => handleCall('108')}
                                        >
                                            <Phone size={16} /> Ambulance
                                        </button>
                                    )}
                                    {!hospital.isFallback && (
                                        <button
                                            className="btn"
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                border: '1px solid var(--glass-border)'
                                            }}
                                            onClick={() => handleDirections(hospital)}
                                        >
                                            <ExternalLink size={16} /> Directions
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : !locationError && (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <MapPinOff size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
                        <p style={{ color: 'var(--text-muted)' }}>
                            Enable location to find hospitals near you.
                        </p>
                    </div>
                )}

                {/* Emergency Tips */}
                <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #fef2f2, #fff1f2)' }}>
                    <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>🚨 Emergency Tips</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
                        <li>Stay calm and assess the situation</li>
                        <li>Call emergency services (112) immediately for life-threatening situations</li>
                        <li>Provide your exact location and describe the emergency clearly</li>
                        <li>Do not move injured persons unless they are in immediate danger</li>
                        <li>Keep emergency contact numbers saved on your phone</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Emergency;
