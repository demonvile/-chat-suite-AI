import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Send, CheckCircle2, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingVoiceAssistantProps {
  token: string;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  setActiveSection?: (sec: string) => void;
}

export const FloatingVoiceAssistant: React.FC<FloatingVoiceAssistantProps> = ({
  token,
  addToast,
  setActiveSection
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [lastResponse, setLastResponse] = useState<{ text: string; action?: any } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const recognitionRef = useRef<any | null>(null);

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech Recognition not supported in this browser.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (e: any) => {
        let currentInterim = '';
        let finalText = '';

        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalText += e.results[i][0].transcript;
          } else {
            currentInterim += e.results[i][0].transcript;
          }
        }

        setInterimText(currentInterim);
        if (finalText) {
          setTranscript(finalText);
          processVoice(finalText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const processVoice = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transcript: text })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.assistantMessage) {
          setLastResponse({
            text: data.assistantMessage.text,
            action: data.assistantMessage.actionExecuted
          });
          speakText(data.assistantMessage.text);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setInterimText('');
      setTranscript('');
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Expanded Voice Widget Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                <span className="font-bold text-xs uppercase tracking-wider text-blue-200">AI Voice Floating Orb</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body Content */}
            <div className="p-4 space-y-4">
              {/* Mic Activation Area */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-xl border border-slate-800 text-center space-y-3">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-bounce shadow-rose-600/40'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  }`}
                >
                  {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <p className="text-xs text-slate-300 font-medium">
                  {isListening ? (interimText ? `"${interimText}"` : 'Listening... speak your command') : 'Tap mic button to speak'}
                </p>
              </div>

              {/* Response Preview */}
              {lastResponse && (
                <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                    <Sparkles size={14} />
                    <span>AI Assistant Spoke</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-[11px]">{lastResponse.text}</p>

                  {lastResponse.action && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
                      <CheckCircle2 size={12} />
                      <span>Action: {lastResponse.action.title}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Link to Full Studio */}
              {setActiveSection && (
                <button
                  onClick={() => {
                    setActiveSection('voice');
                    setIsOpen(false);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Full Voice Studio</span>
                  <ChevronUp size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Orb Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer relative"
        title="AI Voice Assistant"
      >
        <Mic size={22} />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
      </button>
    </div>
  );
};
