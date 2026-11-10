import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Copy, Check, RotateCw, RotateCcw, ThumbsUp, ThumbsDown, 
  Mic, MicOff, Volume2, VolumeX, Paperclip, FileText, Image as ImageIcon,
  X, HelpCircle, ArrowLeft, SendHorizontal, AlertCircle, Calendar, Clock, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatbotConfig, Message } from '../types';

interface ChatbotWidgetProps {
  config: ChatbotConfig;
  inline?: boolean;
}

// Simple custom markdown renderer that supports bold, lists, headers, links, and code highlighting
export const CustomMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const parseContent = (content: string) => {
    // Escape standard code block markers
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        const language = match ? match[1] || 'code' : 'code';
        const code = match ? match[2].trim() : part.slice(3, -3).trim();
        
        return (
          <div key={index} className="my-3 overflow-hidden rounded-lg border border-slate-800 bg-[#0F172A] font-mono text-xs text-slate-200">
            <div className="flex items-center justify-between bg-[#0B1120] px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <span>{language}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Copy size={11} /> Copy
              </button>
            </div>
            <pre className="overflow-x-auto p-3.5 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Inline code parsing
      const inlineParts = part.split(/(`[^`]+`)/g);
      const parsedInline = inlineParts.map((subPart, subIndex) => {
        if (subPart.startsWith('`') && subPart.endsWith('`')) {
          return (
            <code key={subIndex} className="mx-1 rounded bg-slate-100 dark:bg-[#0F172A] px-1.5 py-0.5 font-mono text-xs font-semibold text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800">
              {subPart.slice(1, -1)}
            </code>
          );
        }

        // Parse line-by-line for headings, list items, bold, links, etc.
        const lines = subPart.split('\n');
        return lines.map((line, lineIndex) => {
          let lineContent: React.ReactNode = line;

          // Bold parsing
          if (line.includes('**')) {
            const boldParts = line.split(/\*\*([^*]+)\*\*/g);
            lineContent = boldParts.map((bPart, bIdx) => 
              bIdx % 2 === 1 ? <strong key={bIdx} className="font-bold text-slate-900 dark:text-white">{bPart}</strong> : bPart
            );
          }

          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <li key={lineIndex} className="ml-5 list-disc my-1 text-slate-700 dark:text-slate-300">
                {line.trim().substring(2)}
              </li>
            );
          }

          // Numbered lists
          const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <li key={lineIndex} className="ml-5 list-decimal my-1 text-slate-700 dark:text-slate-300">
                {numMatch[2]}
              </li>
            );
          }

          // Headers
          if (line.startsWith('# ')) {
            return <h1 key={lineIndex} className="text-xl font-display font-bold mt-3 mb-1 text-slate-900 dark:text-white">{line.substring(2)}</h1>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={lineIndex} className="text-lg font-display font-bold mt-3 mb-1 text-slate-900 dark:text-white">{line.substring(3)}</h2>;
          }
          if (line.startsWith('### ')) {
            return <h3 key={lineIndex} className="text-base font-display font-bold mt-2.5 mb-1 text-slate-900 dark:text-white">{line.substring(4)}</h3>;
          }

          // Return standard paragraph block
          return line.trim() ? (
            <p key={lineIndex} className="my-1.5 text-slate-700 dark:text-slate-300 leading-relaxed text-[14px]">
              {lineContent}
            </p>
          ) : (
            <div key={lineIndex} className="h-2" />
          );
        });
      });

      return <React.Fragment key={index}>{parsedInline}</React.Fragment>;
    });
  };

  return <div className="space-y-0.5">{parseContent(text)}</div>;
};

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ config, inline = false }) => {
  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: config.welcomeMessage,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState<string>('');
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: 'image' | 'pdf' | 'text';
    base64: string;
    content?: string;
  } | null>(null);
  
  // Custom states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'ticket'>('chat');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  
  // Speech synthesis & recognition state
  const [isSTTListening, setIsSTTListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Ticket Form state
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketError, setTicketError] = useState('');

  // Lead Form state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Appointment Scheduler states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Load persistent session memory on mount
  useEffect(() => {
    try {
      const savedThreadId = localStorage.getItem('chatsuite_thread_' + config.id);
      if (savedThreadId) {
        setThreadId(savedThreadId);
        fetch(`/api/chat/history?threadId=${encodeURIComponent(savedThreadId)}`)
          .then(res => {
            const isJson = res.headers.get('content-type')?.includes('application/json');
            if (res.ok && isJson) {
              return res.json();
            }
            return null;
          })
          .then(data => {
            if (data && Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages(data.messages);
            }
          })
          .catch(err => console.error('Failed to restore session history', err));
      }
    } catch (e) {}
  }, [config.id]);

  // Set initial thread ID on open if not present
  useEffect(() => {
    if (isOpen && !threadId) {
      const newId = 'thread_' + Math.random().toString(36).substring(2, 11);
      setThreadId(newId);
      try {
        localStorage.setItem('chatsuite_thread_' + config.id, newId);
      } catch (e) {}
      
      // Auto trigger Lead form at startup if config asks for it and not captured yet
      if (config.showLeadOnStart) {
        setShowLeadModal(true);
      }
    }
  }, [isOpen, threadId, config]);

  const handleResetSession = () => {
    try {
      localStorage.removeItem('chatsuite_thread_' + config.id);
    } catch (e) {}
    const newId = 'thread_' + Math.random().toString(36).substring(2, 11);
    setThreadId(newId);
    try {
      localStorage.setItem('chatsuite_thread_' + config.id, newId);
    } catch (e) {}
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        text: config.welcomeMessage,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Sync booking contact details with lead form details automatically
  useEffect(() => {
    if (showBookingModal) {
      if (leadName && !bookingName) setBookingName(leadName);
      if (leadEmail && !bookingEmail) setBookingEmail(leadEmail);
      if (leadPhone && !bookingPhone) setBookingPhone(leadPhone);
    }
  }, [showBookingModal, leadName, leadEmail, leadPhone, bookingName, bookingEmail, bookingPhone]);

  // Appointment scheduling handler
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingEmail || !bookingPhone || !bookingDate || !bookingTime) {
      setBookingError('Please fill out all required fields.');
      return;
    }

    try {
      const res = await fetch(`/api/bots/${config.id}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingName,
          email: bookingEmail,
          phone: bookingPhone,
          date: bookingDate,
          time: bookingTime,
          purpose: bookingPurpose || 'General Consultation',
          threadId
        })
      });

      if (res.ok) {
        setBookingSubmitted(true);
        setBookingError('');
        
        // Populate the lead credentials if not yet captured
        if (!leadName) setLeadName(bookingName);
        if (!leadEmail) setLeadEmail(bookingEmail);
        if (!leadPhone) setLeadPhone(bookingPhone);

        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSubmitted(false);
          setBookingPurpose('');
        }, 1800);

        setMessages(prev => [...prev, {
          id: 'booking-ack-' + Math.random().toString(),
          role: 'assistant',
          text: `📅 **Appointment Confirmed!**\n\n- **Date:** ${bookingDate}\n- **Time:** ${bookingTime}\n- **Name:** ${bookingName}\n- **Purpose:** ${bookingPurpose || 'General Consultation'}\n\nWe have reserved your slot. Look out for updates!`,
          timestamp: new Date().toISOString()
        }]);
      } else {
        const d = await res.json();
        setBookingError(d.error || 'Failed to schedule appointment.');
      }
    } catch (err) {
      setBookingError('Server connection error. Please try again.');
    }
  };

  // Handle Speech Recognition (Voice Input)
  const handleSTT = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        id: 'stt-error-' + Date.now(),
        role: 'assistant',
        text: "🎙️ Speech-to-text (voice input) is not supported on this browser. For the best voice experience, we recommend using Google Chrome or Safari.",
        timestamp: new Date().toISOString()
      }]);
      return;
    }

    if (isSTTListening) {
      setIsSTTListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = config.language === 'es' ? 'es-ES' : config.language === 'fr' ? 'fr-FR' : 'en-US';

    recognition.onstart = () => {
      setIsSTTListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + ' ' + transcript);
      setIsSTTListening(false);
    };

    recognition.onerror = () => {
      setIsSTTListening(false);
    };

    recognition.onend = () => {
      setIsSTTListening(false);
    };

    recognition.start();
  };

  // Speak AI responses (Text to Speech)
  const speakText = (text: string) => {
    if (!isTTSEnabled) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean text from triggers & markdown
    const cleanText = text.replace(/\[TRIGGER_LEAD_FORM\]/g, '').replace(/\*\*|`|#/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = config.language === 'es' ? 'es-ES' : config.language === 'fr' ? 'fr-FR' : 'en-US';
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // File Upload Helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const reader = new FileReader();

    if (fileType.startsWith('image/')) {
      reader.onload = () => {
        setSelectedFile({
          name: file.name,
          type: 'image',
          base64: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'application/pdf') {
      reader.onload = () => {
        setSelectedFile({
          name: file.name,
          type: 'pdf',
          base64: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Treat as plain text
      reader.onload = () => {
        setSelectedFile({
          name: file.name,
          type: 'text',
          base64: '',
          content: reader.result as string
        });
      };
      reader.readAsText(file);
    }
  };

  // Main Send Message Logic
  const handleSendMessage = async (e?: React.FormEvent, forcedText?: string) => {
    if (e) e.preventDefault();
    
    const textToSend = forcedText !== undefined ? forcedText : inputValue;
    if (!textToSend.trim() && !selectedFile) return;

    // Build the user message object
    const userMsg: Message = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
      fileName: selectedFile?.name,
      fileType: selectedFile?.type,
      fileUrl: selectedFile?.type === 'image' ? selectedFile.base64 : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const payloadFile = selectedFile ? {
      name: selectedFile.name,
      type: selectedFile.type,
      base64: selectedFile.base64,
      content: selectedFile.content
    } : null;

    // Reset uploaded file state
    setSelectedFile(null);

    const activeThreadId = threadId || (function() {
      try {
        const stored = localStorage.getItem('chatsuite_thread_' + config.id);
        if (stored) return stored;
      } catch (e) {}
      const created = 'thread_' + Math.random().toString(36).substring(2, 11);
      try {
        localStorage.setItem('chatsuite_thread_' + config.id, created);
      } catch (e) {}
      return created;
    })();

    if (!threadId) {
      setThreadId(activeThreadId);
    }

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: activeThreadId,
          botId: config.id,
          message: textToSend,
          file: payloadFile
        })
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : { error: 'Server returned unexpected response' };
      setIsTyping(false);

      if (data.threadId) {
        setThreadId(data.threadId);
        try {
          localStorage.setItem('chatsuite_thread_' + config.id, data.threadId);
        } catch (e) {}
      }

      if (data.error) {
        setMessages(prev => [...prev, {
          id: 'error-' + Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          text: `⚠️ Error: ${data.error}`,
          timestamp: new Date().toISOString()
        }]);
        return;
      }

      let responseText = data.message.text;
      
      // Look for secret Lead Capture command trigger inside text
      if (responseText.includes('[TRIGGER_LEAD_FORM]')) {
        responseText = responseText.replace(/\[TRIGGER_LEAD_FORM\]/g, '');
        setShowLeadModal(true);
      }

      // Look for secret Appointment Scheduler command trigger inside text
      if (responseText.includes('[TRIGGER_BOOKING_FORM]')) {
        responseText = responseText.replace(/\[TRIGGER_BOOKING_FORM\]/g, '');
        setShowBookingModal(true);
      }

      const aiMsg: Message = {
        id: data.message.id,
        role: 'assistant',
        text: responseText,
        timestamp: data.message.timestamp
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(responseText);

    } catch (err: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: 'err-net',
        role: 'assistant',
        text: '❌ Network issue connecting to AI server. Please check your internet connection.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Toggle Pin message in current conversation
  const togglePinMessage = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isPinned: !m.isPinned } : m));
  };

  // Toggle emoji reaction
  const toggleReaction = (msgId: string, emoji: '👍' | '👎' | '❤️' | '💡' | '🔥') => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m));
    setActiveReactionPickerId(null);
  };

  // Filter messages by search query if search is active
  const displayedMessages = chatSearchQuery.trim()
    ? messages.filter(m => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : messages;

  const pinnedMessages = messages.filter(m => m.isPinned);

  // Feedback scoring helper
  const handleFeedback = async (msgId: string, rating: 1 | -1) => {
    // Optimistic UI update
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, rating } : m));
    
    try {
      await fetch(`/api/chat/message/${msgId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, rating })
      });
    } catch (e) {
      console.error('Failed to submit message feedback', e);
    }
  };

  // Copy answer to clipboard helper
  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Regenerate Answer helper (resends last user message)
  const regenerateAnswer = async () => {
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;
    const lastUserMsg = userMsgs[userMsgs.length - 1];
    
    // Remove last assistant message
    setMessages(prev => {
      const clone = [...prev];
      if (clone[clone.length - 1].role === 'assistant') {
        clone.pop();
      }
      return clone;
    });

    setIsTyping(true);
    
    const activeThreadId = threadId || localStorage.getItem('chatsuite_thread_' + config.id) || '';

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: activeThreadId,
          botId: config.id,
          message: lastUserMsg.text,
          // Repeat feedback regenerator
        })
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : {};
      setIsTyping(false);

      if (data.message) {
        let text = data.message.text
          .replace(/\[TRIGGER_LEAD_FORM\]/g, '')
          .replace(/\[TRIGGER_BOOKING_FORM\]/g, '');
        const aiMsg: Message = {
          id: data.message.id,
          role: 'assistant',
          text,
          timestamp: data.message.timestamp,
          regenerated: true
        };
        setMessages(prev => [...prev, aiMsg]);
        speakText(text);
      }
    } catch (err) {
      setIsTyping(false);
    }
  };

  // Ticket submission handler
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError('');

    if (!ticketEmail || !ticketMsg) {
      setTicketError('Email and Message are required.');
      return;
    }

    try {
      const res = await fetch(`/api/bots/${config.id}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ticketName,
          email: ticketEmail,
          message: ticketMsg
        })
      });

      if (res.ok) {
        setTicketSent(true);
        setTicketName('');
        setTicketEmail('');
        setTicketMsg('');
      } else {
        const d = await res.json();
        setTicketError(d.error || 'Failed to submit ticket');
      }
    } catch (err) {
      setTicketError('Server connection error. Please try again later.');
    }
  };

  // Lead submission handler
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail && !leadPhone) {
      alert('Please provide at least an Email or Phone number so we can reach you.');
      return;
    }

    try {
      const res = await fetch(`/api/bots/${config.id}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          threadId,
          notes: 'Submitted via Chat widget popup form.'
        })
      });

      if (res.ok) {
        setLeadSubmitted(true);
        setTimeout(() => {
          setShowLeadModal(false);
          setLeadSubmitted(false);
          setLeadName('');
          setLeadEmail('');
          setLeadPhone('');
        }, 1500);

        // Append lead captured acknowledgment inside messages
        setMessages(prev => [...prev, {
          id: 'lead-ack',
          role: 'assistant',
          text: '✓ **Thank you!** Your contact details have been securely recorded. Our business representative will reach out to you shortly.',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (e) {
      alert('Connection error submitting details.');
    }
  };

  const widgetThemeClass = config.theme === 'dark' ? 'dark bg-[#0F172A] text-slate-100 border-slate-800' : 'bg-white text-slate-800 border-slate-250';

  return (
    <div id="chatbot-widget-root" className={`relative ${inline ? 'w-full h-full' : ''}`}>
      {/* Dynamic Custom CSS injection */}
      {config.customCss && (
        <style dangerouslySetInnerHTML={{ __html: config.customCss }} />
      )}

      {/* 1. Floating Launcher Button (visible only when not in inline mode and widget closed) */}
      {!inline && !isOpen && (
        <motion.button
          id="chatbot-widget-launcher"
          layoutId="widget-container"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: config.primaryColor }}
          className={`fixed bottom-6 ${config.position === 'left' ? 'left-6' : 'right-6'} z-50 p-4 rounded-full shadow-2xl hover:scale-110 cursor-pointer text-white flex items-center justify-center transition-transform`}
          whileTap={{ scale: 0.95 }}
        >
          {config.avatarUrl ? (
            <img src={config.avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <Bot size={28} />
          )}
        </motion.button>
      )}

      {/* 2. Interactive Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-widget-container"
            layoutId="widget-container"
            className={`${
              inline 
                ? 'w-full h-full flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden' 
                : `fixed bottom-2 sm:bottom-6 ${config.position === 'left' ? 'left-2 sm:left-6' : 'right-2 sm:right-6'} w-[calc(100vw-1rem)] sm:w-[400px] max-w-[400px] h-[calc(100vh-2rem)] sm:h-[580px] max-h-[600px] z-50 flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden`
            } ${widgetThemeClass}`}
          >
            {/* Widget Header */}
            <div 
              style={{ backgroundColor: config.primaryColor }} 
              className="px-4 py-3.5 text-white flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
                  {config.avatarUrl ? (
                    <img src={config.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Bot size={20} className="text-white" />
                  )}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm leading-tight truncate">{config.botName}</h3>
                    {config.logoUrl && (
                      <img src={config.logoUrl} alt="Logo" className="h-4 max-w-[80px] object-contain opacity-90" />
                    )}
                  </div>
                  <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online Support Agent
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Reset Session Button */}
                <button
                  onClick={handleResetSession}
                  title="New Conversation Session"
                  className="p-1.5 rounded-md hover:bg-white/15 transition-colors cursor-pointer text-white"
                >
                  <RotateCcw size={16} />
                </button>

                {/* Search Toggle */}
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  title="Search conversation"
                  className="p-1.5 rounded-md hover:bg-white/15 transition-colors cursor-pointer text-white"
                >
                  <Search size={16} />
                </button>

                {/* Voice Output Toggle */}
                <button
                  onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                  title={isTTSEnabled ? "Disable voice output" : "Enable voice output"}
                  className="p-1.5 rounded-md hover:bg-white/15 transition-colors cursor-pointer text-white"
                >
                  {isTTSEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                {/* Switch between Chat and Contact Support Tickets */}
                {activeTab === 'chat' ? (
                  <button
                    onClick={() => setActiveTab('ticket')}
                    className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors text-white cursor-pointer"
                  >
                    Ticket Form
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors text-white cursor-pointer"
                  >
                    Back to Chat
                  </button>
                )}

                {!inline && (
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-md hover:bg-white/15 transition-colors cursor-pointer text-white"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50/70 dark:bg-[#0B1120]">
              
              {/* Support Ticket Tab */}
              {activeTab === 'ticket' ? (
                <div className="p-5 h-full overflow-y-auto flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                      <HelpCircle size={16} style={{ color: config.primaryColor }} /> Submit Support Ticket
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mb-4 leading-relaxed">
                      AI agent couldn't resolve your issue? No problem! File a support ticket and our human team will follow up via email within 24 hours.
                    </p>

                    {ticketSent ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-center my-6"
                      >
                        <span className="text-2xl">✓</span>
                        <h5 className="font-semibold text-emerald-800 dark:text-emerald-400 mt-2">Ticket Submitted!</h5>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1">We've saved your request. Check your inbox for updates.</p>
                        <button 
                          onClick={() => setTicketSent(false)}
                          style={{ borderColor: config.primaryColor, color: config.primaryColor }}
                          className="mt-4 text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-900 transition-all font-medium cursor-pointer"
                        >
                          Submit Another
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleTicketSubmit} className="space-y-3.5">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={ticketName}
                            onChange={(e) => setTicketName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full text-xs px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Email Address *</label>
                          <input 
                            type="email" 
                            required
                            value={ticketEmail}
                            onChange={(e) => setTicketEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full text-xs px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1">Detailed Message *</label>
                          <textarea 
                            required
                            rows={4}
                            value={ticketMsg}
                            onChange={(e) => setTicketMsg(e.target.value)}
                            placeholder="Please describe how we can assist you..."
                            className="w-full text-xs px-3 py-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100 resize-none"
                          />
                        </div>
                        {ticketError && (
                          <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-lg">
                            <AlertCircle size={14} /> {ticketError}
                          </div>
                        )}
                        <button 
                          type="submit"
                          style={{ backgroundColor: config.primaryColor }}
                          className="w-full py-2 rounded-lg font-semibold text-white text-xs hover:opacity-95 transition-opacity cursor-pointer flex items-center justify-center gap-1"
                        >
                          Send Ticket
                        </button>
                      </form>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className="text-xs text-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center gap-1 mt-6 cursor-pointer"
                  >
                    <ArrowLeft size={13} /> Back to chatbot conversation
                  </button>
                </div>
              ) : (
                /* Chat Conversation Tab */
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  
                  {/* Conversation Search Bar */}
                  {showSearch && (
                    <div className="p-2 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <Search size={14} className="text-slate-400 ml-1" />
                      <input 
                        type="text" 
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        placeholder="Search conversation messages..."
                        className="flex-1 text-xs bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200"
                        autoFocus
                      />
                      {chatSearchQuery && (
                        <button onClick={() => setChatSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Pinned Messages Banner */}
                  {pinnedMessages.length > 0 && !chatSearchQuery && (
                    <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/50 flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold">📌 Pinned ({pinnedMessages.length}):</span>
                        <span className="truncate italic">"{pinnedMessages[pinnedMessages.length - 1].text.slice(0, 45)}..."</span>
                      </div>
                    </div>
                  )}

                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {displayedMessages.map((m, index) => {
                      const isUser = m.role === 'user';
                      return (
                        <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 overflow-hidden ${
                              isUser ? 'bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'text-white'
                            }`} style={!isUser ? { backgroundColor: config.primaryColor } : undefined}>
                              {isUser ? (
                                <User size={13} />
                              ) : config.avatarUrl ? (
                                <img src={config.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <Bot size={13} />
                              )}
                            </div>

                            {/* Message Container */}
                            <div className="space-y-1 relative group">
                              <div className={`p-3 rounded-2xl text-[13px] shadow-xs relative ${
                                isUser 
                                  ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tr-none' 
                                  : 'bg-white text-slate-800 dark:bg-[#0F172A] dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/80 rounded-tl-none'
                              }`}>
                                <CustomMarkdown text={m.text} />
                                
                                {/* Image display helper if sent in user chat */}
                                {m.fileUrl && (
                                  <div className="mt-2 overflow-hidden rounded-lg max-w-[200px]">
                                    <img src={m.fileUrl} alt="Attached input" className="w-full h-auto object-cover" />
                                  </div>
                                )}

                                {/* Emoji Reaction Badge if present */}
                                {m.reaction && (
                                  <div className="absolute -bottom-2 -right-1 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-full px-1.5 py-0.5 text-[10px] shadow-xs">
                                    {m.reaction}
                                  </div>
                                )}
                              </div>

                              {/* Footer Options (Timestamp, Reactions, Pin, Copy, Regenerate) */}
                              <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 dark:text-slate-500 select-none">
                                <span>{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                
                                <button 
                                  onClick={() => copyMessage(m.id, m.text)} 
                                  className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                >
                                  {copiedId === m.id ? 'Copied!' : 'Copy'}
                                </button>

                                {/* Emoji Reaction Picker Toggle */}
                                <div className="relative">
                                  <button
                                    onClick={() => setActiveReactionPickerId(activeReactionPickerId === m.id ? null : m.id)}
                                    className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                                    title="React with emoji"
                                  >
                                    😃
                                  </button>

                                  {activeReactionPickerId === m.id && (
                                    <div className="absolute bottom-5 left-0 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-lg flex items-center gap-1 z-20">
                                      {(['👍', '👎', '❤️', '💡', '🔥'] as const).map(emoji => (
                                        <button
                                          key={emoji}
                                          onClick={() => toggleReaction(m.id, emoji)}
                                          className="p-1 hover:scale-125 transition-transform cursor-pointer text-xs"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Pin Message */}
                                <button
                                  onClick={() => togglePinMessage(m.id)}
                                  className={`hover:text-amber-500 transition-colors cursor-pointer ${m.isPinned ? 'text-amber-500 font-bold' : ''}`}
                                  title={m.isPinned ? "Unpin message" : "Pin message"}
                                >
                                  📌
                                </button>

                                {/* Feedback thumbs for assistant */}
                                {!isUser && m.id !== 'welcome' && (
                                  <>
                                    <button 
                                      onClick={() => handleFeedback(m.id, 1)}
                                      className={`hover:scale-110 cursor-pointer ${m.rating === 1 ? 'text-emerald-500' : ''}`}
                                    >
                                      <ThumbsUp size={11} />
                                    </button>
                                    <button 
                                      onClick={() => handleFeedback(m.id, -1)}
                                      className={`hover:scale-110 cursor-pointer ${m.rating === -1 ? 'text-rose-500' : ''}`}
                                    >
                                      <ThumbsDown size={11} />
                                    </button>

                                    {index === displayedMessages.length - 1 && (
                                      <button 
                                        onClick={regenerateAnswer}
                                        className="flex items-center gap-0.5 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer ml-auto"
                                      >
                                        <RotateCw size={10} /> Regenerate
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Animation Loader */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-2.5 max-w-[85%]">
                          <div style={{ backgroundColor: config.primaryColor }} className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0">
                            <Bot size={13} />
                          </div>
                          <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-[11px]">AI Agent thinking</span>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attachment indicator if selected */}
                  {selectedFile && (
                    <div className="mx-4 mb-2 p-2.5 bg-slate-100 dark:bg-[#0F172A] rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        {selectedFile.type === 'image' ? <ImageIcon size={14} className="text-sky-500" /> : <FileText size={14} className="text-rose-500" />}
                        <span className="truncate font-semibold">{selectedFile.name}</span>
                        <span className="text-[10px] text-slate-450 uppercase">({selectedFile.type})</span>
                      </div>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  {/* Input form */}
                  <form onSubmit={(e) => handleSendMessage(e)} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] flex items-center gap-2">
                    
                    {/* Attachment trigger */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach Image or PDF"
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*,application/pdf,text/plain" 
                      className="hidden" 
                    />

                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={config.placeholderText || "Type your message..."}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-200"
                    />

                    {/* Mic Voice Input */}
                    <button
                      type="button"
                      onClick={handleSTT}
                      className={`p-2 transition-colors rounded-lg cursor-pointer ${
                        isSTTListening 
                          ? 'bg-rose-500 text-white animate-pulse' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-800'
                      }`}
                      title="Dictate message (Speech to Text)"
                    >
                      {isSTTListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!inputValue.trim() && !selectedFile}
                      style={inputValue.trim() || selectedFile ? { backgroundColor: config.primaryColor } : {}}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 disabled:opacity-50 rounded-xl text-white cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <Send size={16} className={(inputValue.trim() || selectedFile) ? 'text-white' : ''} />
                    </button>
                  </form>
                </div>
              )}

              {/* 3. Embedded Lead Capture Form Modal (Overlay inside chatbot panel) */}
              <AnimatePresence>
                {showLeadModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 15 }}
                      className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 w-full max-w-[340px] rounded-2xl p-5 shadow-2xl relative"
                    >
                      {/* Close lead modal only if showLeadOnStart is false, to let users skip if needed */}
                      {!config.showLeadOnStart && (
                        <button 
                          onClick={() => setShowLeadModal(false)}
                          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      )}

                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white mb-2.5" style={{ backgroundColor: config.primaryColor }}>
                          <Bot size={18} />
                        </div>
                        <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white">Let's stay in touch!</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Please fill out your contact details so our business representative can follow up with your inquiry directly.
                        </p>
                      </div>

                      {leadSubmitted ? (
                        <div className="text-center py-4 text-emerald-600 dark:text-emerald-400 font-semibold text-xs animate-bounce mt-4">
                          ✓ Details Saved Successfully!
                        </div>
                      ) : (
                        <form onSubmit={handleLeadSubmit} className="space-y-3 mt-4">
                          {config.leadFields.includes('name') && (
                            <div>
                              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Your Name</label>
                              <input 
                                type="text"
                                required
                                value={leadName}
                                onChange={(e) => setLeadName(e.target.value)}
                                placeholder="Jane Smith"
                                className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          )}

                          {config.leadFields.includes('email') && (
                            <div>
                              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Email Address</label>
                              <input 
                                type="email"
                                required={config.leadFields.includes('email')}
                                value={leadEmail}
                                onChange={(e) => setLeadEmail(e.target.value)}
                                placeholder="jane@example.com"
                                className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          )}

                          {config.leadFields.includes('phone') && (
                            <div>
                              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Phone Number</label>
                              <input 
                                type="tel"
                                required={config.leadFields.includes('phone') && !config.leadFields.includes('email')}
                                value={leadPhone}
                                onChange={(e) => setLeadPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            style={{ backgroundColor: config.primaryColor }}
                            className="w-full py-2 rounded-lg font-semibold text-white text-xs hover:opacity-95 transition-opacity cursor-pointer mt-4"
                          >
                            Submit Information
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 4. Embedded Appointment Scheduler Form Modal (Overlay inside chatbot panel) */}
              <AnimatePresence>
                {showBookingModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 15 }}
                      className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 w-full max-w-[340px] rounded-2xl p-4 shadow-2xl relative my-auto max-h-[92%] overflow-y-auto"
                    >
                      <button 
                        type="button"
                        onClick={() => setShowBookingModal(false)}
                        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X size={15} />
                      </button>

                      <div className="text-center">
                        <div className="w-9 h-9 rounded-full mx-auto flex items-center justify-center text-white mb-2" style={{ backgroundColor: config.primaryColor }}>
                          <Calendar size={16} />
                        </div>
                        <h4 className="font-display font-bold text-xs text-slate-800 dark:text-white">Schedule Appointment</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          Select your desired date and time slot below.
                        </p>
                      </div>

                      {bookingSubmitted ? (
                        <div className="text-center py-6 text-emerald-600 dark:text-emerald-400 font-semibold text-xs animate-pulse mt-4">
                          🎉 Appointment Booked successfully!
                        </div>
                      ) : (
                        <form onSubmit={handleBookingSubmit} className="space-y-2 mt-3">
                          <div>
                            <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Select Date *</label>
                            <input 
                              type="date"
                              required
                              value={bookingDate}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setBookingDate(e.target.value)}
                              className="w-full text-xs px-2.5 py-1 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Select Time *</label>
                              <select 
                                required
                                value={bookingTime}
                                onChange={(e) => setBookingTime(e.target.value)}
                                className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                              >
                                <option value="09:00">9:00 AM</option>
                                <option value="09:30">9:30 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="10:30">10:30 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="11:30">11:30 AM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="13:30">1:30 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="14:30">2:30 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="15:30">3:30 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="16:30">4:30 PM</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Full Name *</label>
                              <input 
                                type="text"
                                required
                                value={bookingName}
                                onChange={(e) => setBookingName(e.target.value)}
                                placeholder="Jane Smith"
                                className="w-full text-xs px-2.5 py-1 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Email Address *</label>
                              <input 
                                type="email"
                                required
                                value={bookingEmail}
                                onChange={(e) => setBookingEmail(e.target.value)}
                                placeholder="jane@example.com"
                                className="w-full text-xs px-2.5 py-1 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Phone *</label>
                              <input 
                                type="tel"
                                required
                                value={bookingPhone}
                                onChange={(e) => setBookingPhone(e.target.value)}
                                placeholder="(555) 000-0000"
                                className="w-full text-xs px-2.5 py-1 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Purpose of Consultation</label>
                            <input 
                              type="text"
                              value={bookingPurpose}
                              onChange={(e) => setBookingPurpose(e.target.value)}
                              placeholder="e.g. Sales, Partnership, Technical Support"
                              className="w-full text-xs px-2.5 py-1 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          {bookingError && (
                            <div className="text-[9px] text-rose-600 bg-rose-50 dark:bg-rose-950/25 px-2 py-1 rounded-lg flex items-center gap-1">
                              <AlertCircle size={10} /> {bookingError}
                            </div>
                          )}

                          <button
                            type="submit"
                            style={{ backgroundColor: config.primaryColor }}
                            className="w-full py-2 rounded-lg font-semibold text-white text-xs hover:opacity-95 transition-opacity cursor-pointer mt-1"
                          >
                            Schedule Slot
                          </button>
                        </form>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Widget branding footer */}
            <div className="bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 text-center py-1.5 text-[9px] text-slate-450 dark:text-slate-600 font-medium select-none flex items-center justify-center gap-0.5">
              <span>Powered by</span>
              <Bot size={10} style={{ color: config.primaryColor }} />
              <span className="font-semibold" style={{ color: config.primaryColor }}>ChatSuite AI</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
