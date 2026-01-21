import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Send, Mic, Video, Play, Square, MessageCircle } from 'lucide-react';

const LiveTranslationPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    try {
      const response = await api.post('/live-session/start');
      if (response.data.success) {
        setSessionId(response.data.session_id);
        setIsActive(true);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      await api.post(`/live-session/${sessionId}/end`);
      setIsActive(false);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !sessionId) return;

    setLoading(true);
    const userMessage = inputText;
    setInputText('');

    // Add user message to UI
    const newMessage = {
      id: Date.now(),
      original: userMessage,
      translated: '[Translating...]',
      timestamp: new Date().toISOString()
    };
    setMessages([...messages, newMessage]);

    try {
      // Simulate translation
      const translationResponse = await api.post('/translate', {
        input_type: 'text',
        input_content: userMessage,
        input_language: 'en',
        output_type: 'text',
        output_language: 'ar'
      });

      const translated = translationResponse.data.output_content;

      // Save to session
      await api.post(`/live-session/${sessionId}/message`, {
        message_type: 'text',
        original_content: userMessage,
        translated_content: translated
      });

      // Update message with translation
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, translated } : m
      ));
    } catch (error) {
      console.error('Failed to translate:', error);
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, translated: '[Translation failed]' } : m
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" data-testid="live-translation-page">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Live Translation</h1>
          <p className="text-muted-foreground">Real-time conversation translation</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Session Control */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="font-medium">
                {isActive ? 'Session Active' : 'No Active Session'}
              </span>
            </div>
            <div>
              {!isActive ? (
                <button onClick={startSession} className="btn-primary" data-testid="start-session-button">
                  <Play className="w-4 h-4 inline mr-2" />
                  Start Session
                </button>
              ) : (
                <button onClick={endSession} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors" data-testid="end-session-button">
                  <Square className="w-4 h-4 inline mr-2" />
                  End Session
                </button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4" data-testid="messages-container">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Start a session to begin translating</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4" data-testid={`message-${message.id}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Original:</p>
                      <p className="text-gray-900 dark:text-gray-100">{message.original}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Translation:</p>
                      <p className="text-gray-900 dark:text-gray-100">{message.translated}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {isActive && (
            <div className="border-t p-4" data-testid="input-area">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                  disabled={loading}
                  data-testid="message-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !inputText.trim()}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="send-message-button"
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTranslationPage;