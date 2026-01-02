import { useState, useEffect } from 'react';

const useVoice = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            setSupported(false);
            return;
        }
    }, []);

    const startListening = () => {
        if (!supported) return;
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US'; // Default to English, could be toggled
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
        };

        recognition.start();
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    return { isListening, transcript, startListening, speak, supported };
};

export default useVoice;
