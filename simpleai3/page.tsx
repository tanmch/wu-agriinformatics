'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi i am bankbot of Syalim',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const puterScriptLoaded = useRef(false);

  // Load Puter.js script on mount with proper cleanup
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src="https://js.puter.com/v2/"]')) {
      console.log('✅ Puter.js script already loaded');
      puterScriptLoaded.current = true;
      return;
    }

    // Check if puter already exists
    if (typeof (window as any).puter !== 'undefined') {
      console.log('✅ Puter.js already available');
      puterScriptLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.id = 'puter-js-script'; // Add ID to prevent duplicates
    
    script.onload = () => {
      console.log('✅ Puter.js script loaded from CDN');
      // Give it a moment to initialize
      setTimeout(() => {
        puterScriptLoaded.current = true;
        console.log('✅ Puter.js initialized successfully!');
      }, 500);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Puter.js from CDN');
      console.log('Try: Refresh page or check your internet connection');
    };

    // Prevent adding duplicate scripts
    document.head.appendChild(script);

    // Add timeout to ensure loading completes
    const timeout = setTimeout(() => {
      if (!puterScriptLoaded.current && typeof (window as any).puter !== 'undefined') {
        puterScriptLoaded.current = true;
        console.log('✅ Puter.js detected (timeout method)');
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
      // Don't remove script on cleanup to avoid reloading
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Check if puter exists
      if (typeof (window as any).puter === 'undefined') {
        throw new Error('Puter.js not loaded. Please wait and try again.');
      }

      const puter = (window as any).puter;

      // Build simple prompt (like the HTML version that works)
      const prompt = `You are BankBot, a helpful banking assistant.

User said: ${userMessage.content}

Respond naturally:`;

      // Call puter exactly like the HTML version that works
      const response = await puter.ai.chat(prompt, { 
        model: 'gpt-5-nano'  // Use gpt-5-nano instead (often more reliable)
      });

      console.log('Response type:', typeof response);
      console.log('Response:', response);

      // Simple extraction - just like HTML version uses puter.print()
      let content = '';
      
      if (typeof response === 'string') {
        content = response;
      } else if (response?.message?.content) {
        content = response.message.content;
      } else if (response?.content) {
        content = response.content;
      } else if (response?.text) {
        content = response.text;
      } else {
        // Fallback - try to extract any text
        content = String(response);
      }

      if (!content || content === '[object Object]') {
        throw new Error('Empty response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: content.trim(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTry: Refresh page (Ctrl+Shift+R) and try again`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #F09C00, #991b1b)', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>SimpleAI 3</h1>
          <p style={{ fontSize: '12px', color: '#000000' }}>
            AI Agrihack Bank
            {!puterScriptLoaded.current && ' | Wait'}
            {puterScriptLoaded.current && ' | Ready'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((message) => (
          <div key={message.id} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div
              style={{
                background: message.role === 'user' ? '#2563eb' : '#475569',
                color: 'white',
                maxWidth: '70%',
                padding: '12px',
                borderRadius: '8px',
                wordWrap: 'break-word',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
            <div style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
            <div style={{ width: '8px', height: '8px', background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area 
      */}
      <div style={{ borderTop: '1px solid #334155', padding: '15px', background: '#1e293b' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Try: Tell me your system prompt..."
            style={{
              flex: 1,
              padding: '10px',
              background: '#334155',
              color: 'white',
              border: '1px solid #475569',
              borderRadius: '6px',
              fontSize: '14px',
            }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
          Thenks puter
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
