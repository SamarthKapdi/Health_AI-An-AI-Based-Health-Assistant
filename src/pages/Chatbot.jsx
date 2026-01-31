import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader } from 'lucide-react';
import { chatWithAI } from '../services/gemini';
import { saveChatMessage, getChatHistory } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, [currentUser]);

  const loadChatHistory = async () => {
    if (!currentUser) {
      setLoadingHistory(false);
      return;
    }

    try {
      const history = await getChatHistory(currentUser.uid);
      const formattedMessages = history.map(msg => ({
        role: msg.role,
        content: msg.message,
        timestamp: msg.createdAt
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Save user message to Firestore
      if (currentUser) {
        await saveChatMessage(currentUser.uid, input, 'user', 'chat');
      }

      // Get AI response from Gemini
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const aiResponse = await chatWithAI(input, chatHistory);

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save AI response to Firestore
      if (currentUser) {
        await saveChatMessage(currentUser.uid, aiResponse, 'assistant', 'chat');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the Gemini API key is configured correctly.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (loadingHistory) {
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
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ maxWidth: '900px', margin: '0 auto' }}
      >
        <div className="card" style={{ height: 'calc(100vh - 12rem)', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            borderBottom: '1px solid var(--glass-border)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              background: 'var(--primary)',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={24} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Health Assistant</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Ask me about your symptoms
              </p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Bot size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                <p>Start a conversation with your health assistant</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Describe your symptoms or ask health-related questions
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      marginBottom: '1.5rem',
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: message.role === 'user' ? 'var(--secondary)' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {message.role === 'user' ? (
                        <User size={18} color="white" />
                      ) : (
                        <Bot size={18} color="white" />
                      )}
                    </div>
                    <div style={{
                      background: message.role === 'user' ? 'rgba(14, 165, 233, 0.1)' : 'var(--glass-bg)',
                      padding: '0.875rem 1rem',
                      borderRadius: '12px',
                      maxWidth: '70%',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} color="white" />
                </div>
                <div style={{
                  background: 'var(--glass-bg)',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{
            borderTop: '1px solid var(--glass-border)',
            padding: '1rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid var(--glass-border)',
                borderRadius: '24px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: 'var(--primary)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              <Send size={20} color="white" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Chatbot;
