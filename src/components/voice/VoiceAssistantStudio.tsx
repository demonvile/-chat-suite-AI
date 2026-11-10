import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Play, Pause, Square, RefreshCw, 
  Settings, Sliders, Globe, Sparkles, Zap, Calendar, Users, HelpCircle, 
  FileText, Shield, Key, Keyboard, Eye, CheckCircle2, AlertCircle, ArrowRight,
  Send, Trash2, ShieldCheck, Activity, Radio, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceSettings, VoiceConversationMessage, VoiceShortcutCommand } from '../../types';

interface VoiceAssistantStudioProps {
  token: string;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  setActiveSection?: (sec: string) => void;
}

export const VoiceAssistantStudio: React.FC<VoiceAssistantStudioProps> = ({
  token,
  addToast,
  setActiveSection
}) => {
  // Voice Settings State
  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'en-US',
    autoLanguageDetect: true,
    voiceName: '',
    speakingRate: 1.0,
    speakingPitch: 1.0,
    emotion: 'professional',
    mode: 'push_to_talk',
    noiseReduction: true,
    autoConfirmBusinessActions: true,
    screenReaderCaptions: true
  });

  // State Management
  const [activeTab, setActiveTab] = useState<'conversation' | 'shortcuts' | 'settings' | 'business_actions'>('conversation');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [messages, setMessages] = useState<VoiceConversationMessage[]>([]);
  const [shortcuts, setShortcuts] = useState<VoiceShortcutCommand[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Audio Speech Synthesis State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Web Audio Visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any | null>(null);

  // Load SpeechSynthesis Voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !settings.voiceName) {
          const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
          setSettings(prev => ({ ...prev, voiceName: defaultVoice.name }));
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Fetch Initial Voice Shortcuts and Conversation History
  useEffect(() => {
    fetch('/api/voice/shortcuts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json')) ? res.json() : null)
      .then(data => {
        if (data?.shortcuts) setShortcuts(data.shortcuts);
        if (data?.history) setMessages(data.history);
      })
      .catch(err => console.error('Failed to load voice shortcuts', err));
  }, [token]);

  // Keyboard Shortcuts (Hold Spacebar or Ctrl+Shift+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.ctrlKey && !isListening) {
        e.preventDefault();
        startListening();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.ctrlKey && isListening) {
        e.preventDefault();
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening]);

  // Audio Context Frequency Visualizer
  const startAudioVisualizer = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const drawCanvas = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#2563eb');
          gradient.addColorStop(1, '#38bdf8');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }

        animationFrameRef.current = requestAnimationFrame(drawCanvas);
      };

      drawCanvas();
    } catch (e) {
      console.warn('Microphone audio stream visualizer unavailable or permission denied', e);
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  // Start Speech Recognition
  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech Recognition API is not supported in this browser. You can type commands below.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = settings.mode === 'continuous';
      recognition.interimResults = true;
      recognition.lang = settings.language;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
        startAudioVisualizer();
        addToast(`Voice listening started in ${settings.language}`, 'info');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimText(currentInterim);
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleProcessVoiceInput(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        stopAudioVisualizer();
        if (event.error !== 'no-speech') {
          addToast(`Voice input error: ${event.error}`, 'error');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioVisualizer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition', e);
      addToast('Could not initialize microphone recognition.', 'error');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    stopAudioVisualizer();
  };

  // Process Voice Command via Server Engine
  const handleProcessVoiceInput = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transcript: spokenText,
          language: settings.language,
          emotion: settings.emotion,
          mode: settings.mode,
          autoConfirm: settings.autoConfirmBusinessActions
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.history) setMessages(data.history);
        
        // Auto Speak Assistant Response if Text-To-Speech is active
        if (data.assistantMessage?.text) {
          speakText(data.assistantMessage.text, data.assistantMessage.id || 'voice-msg');
        }

        if (data.assistantMessage?.actionExecuted) {
          addToast(`Voice Action Executed: ${data.assistantMessage.actionExecuted.title}`, 'success');
        }
      } else {
        addToast('Voice server processing failed.', 'error');
      }
    } catch (e) {
      console.error('Error processing voice input:', e);
      addToast('Network error processing voice command.', 'error');
    } finally {
      setIsProcessing(false);
      setTranscript('');
      setInterimText('');
      setTextInput('');
    }
  };

  // Text-To-Speech Synthesis Controller
  const speakText = (text: string, msgId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any existing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speakingRate;
    utterance.pitch = settings.speakingPitch;
    utterance.lang = settings.language;

    if (settings.voiceName) {
      const chosenVoice = availableVoices.find(v => v.name === settings.voiceName);
      if (chosenVoice) utterance.voice = chosenVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentlySpeakingId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentlySpeakingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-800/40 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Radio size={12} className="animate-pulse text-blue-400" />
                Enterprise Voice Studio
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                STT / TTS Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Voice Business Assistant</h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Interact hands-free using high-precision speech-to-text, natural neural voice synthesis, 
              noise cancellation, and automated business intent execution.
            </p>
          </div>

          {/* Quick Voice Activation Orb */}
          <div className="flex items-center gap-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-3 shadow-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-102'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              <span>{isListening ? 'Stop Listening' : 'Activate Voice Assistant'}</span>
            </button>
          </div>
        </div>

        {/* Live Audio Spectrum Canvas Visualizer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-slate-300">
              {isListening ? (interimText ? `Listening: "${interimText}"` : 'Listening for voice input...') : 'Voice status: Idle (Tap microphone or hold Spacebar)'}
            </span>
          </div>

          {/* Frequency Canvas */}
          <div className="w-full sm:w-64 h-8 bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
            {isListening ? (
              <canvas ref={canvasRef} width={250} height={32} className="w-full h-full" />
            ) : (
              <div className="flex items-center gap-1">
                {[40, 70, 30, 90, 60, 20, 80, 50, 95, 30, 60, 40].map((h, idx) => (
                  <div key={idx} className="w-1 bg-slate-700 rounded-full" style={{ height: `${h}%` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('conversation')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'conversation'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Headphones size={15} />
          <span>Live Conversation & Transcripts</span>
        </button>

        <button
          onClick={() => setActiveTab('business_actions')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'business_actions'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap size={15} />
          <span>Voice Business Actions</span>
        </button>

        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'shortcuts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles size={15} />
          <span>Voice Shortcuts Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders size={15} />
          <span>Audio & Voice Settings</span>
        </button>
      </div>

      {/* 3. TAB 1: Live Voice Conversation Stream */}
      {activeTab === 'conversation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Voice Chat Column */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-[600px]">
            {/* Top Bar Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mic size={16} className="text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Voice Conversation Stream</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {messages.length} exchanges
                </span>
              </div>

              {/* Global Audio Playback Controls */}
              {isSpeaking && (
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Speaking AI...</span>
                  {isPaused ? (
                    <button onClick={resumeSpeaking} className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer">
                      <Play size={14} />
                    </button>
                  ) : (
                    <button onClick={pauseSpeaking} className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer">
                      <Pause size={14} />
                    </button>
                  )}
                  <button onClick={stopSpeaking} className="p-1 text-rose-600 hover:text-rose-800 cursor-pointer">
                    <Square size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Conversation Stream Scroll Area */}
            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Headphones size={36} className="mb-3 text-slate-300 dark:text-slate-600 animate-bounce" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No voice recordings yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Tap the microphone button above or press Spacebar to start a voice query.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const isCurrentSpeech = currentlySpeakingId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs transition-all ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-none'
                        } ${isCurrentSpeech ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1.5 opacity-80 text-[10px]">
                          <span className="font-bold uppercase tracking-wider">{isUser ? 'You (Spoke)' : 'AI Voice Assistant'}</span>
                          <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <p className="text-xs font-medium whitespace-pre-wrap">{msg.text}</p>

                        {/* Executed Action Badge */}
                        {msg.actionExecuted && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200/40 dark:border-slate-700/60 bg-emerald-500/10 rounded-lg p-2.5 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <div className="flex items-center gap-1.5 font-bold">
                              <CheckCircle2 size={13} />
                              <span>{msg.actionExecuted.title}</span>
                            </div>
                            <div className="mt-1 text-[10px] space-y-0.5 opacity-90 font-mono">
                              {Object.entries(msg.actionExecuted.details).map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                  <span className="capitalize">{k}:</span>
                                  <span className="font-semibold">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Audio Playback trigger button for Assistant messages */}
                        {!isUser && (
                          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/30 dark:border-slate-700/40">
                            <button
                              onClick={() => speakText(msg.text, msg.id)}
                              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 size={12} />
                              <span>{isCurrentSpeech ? 'Replay Speech' : 'Play Audio'}</span>
                            </button>
                            {msg.audioDurationSec && (
                              <span className="text-[10px] text-slate-400 font-mono">{msg.audioDurationSec}s audio</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Text Fallback / Direct Send Input */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textInput.trim()) {
                    handleProcessVoiceInput(textInput);
                  }
                }}
                placeholder="Type a voice command shortcut or topic..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-xl text-white transition-all cursor-pointer ${
                  isListening ? 'bg-rose-600 animate-pulse' : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title="Microphone Input"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={() => textInput.trim() && handleProcessVoiceInput(textInput)}
                disabled={!textInput.trim() || isProcessing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send size={14} />
                <span>Execute</span>
              </button>
            </div>
          </div>

          {/* Side Controls & Quick Audio Panel */}
          <div className="space-y-6">
            {/* Quick Audio Controls Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 size={16} className="text-blue-600" />
                Live Speech Output Controls
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Select Speech Voice</label>
                  <select
                    value={settings.voiceName}
                    onChange={(e) => setSettings({ ...settings, voiceName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-800 dark:text-slate-200"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                    {availableVoices.length === 0 && <option value="">System Default Voice</option>}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 font-semibold mb-1">
                    <span>Speaking Speed (Rate)</span>
                    <span className="font-mono text-blue-600">{settings.speakingRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.speakingRate}
                    onChange={(e) => setSettings({ ...settings, speakingRate: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 font-semibold mb-1">
                    <span>Voice Pitch</span>
                    <span className="font-mono text-blue-600">{settings.speakingPitch}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={settings.speakingPitch}
                    onChange={(e) => setSettings({ ...settings, speakingPitch: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Emotion Response Profile</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['professional', 'enthusiastic', 'empathetic', 'calm', 'concise'] as const).map((emo) => (
                      <button
                        key={emo}
                        onClick={() => setSettings({ ...settings, emotion: emo })}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                          settings.emotion === emo
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Accessibility & Hotkeys Summary */}
            <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Keyboard size={14} className="text-blue-400" />
                Keyboard Shortcuts & Accessibility
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-slate-800/60 p-2 rounded-lg">
                  <span>Push-To-Talk</span>
                  <kbd className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">Ctrl + Space</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-800/60 p-2 rounded-lg">
                  <span>Stop Speech Output</span>
                  <kbd className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">ESC</kbd>
                </div>
                <div className="flex justify-between items-center bg-slate-800/60 p-2 rounded-lg">
                  <span>Submit Command</span>
                  <kbd className="bg-slate-950 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">Enter</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: Voice Business Actions */}
      {activeTab === 'business_actions' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Voice Business Action Simulations</h3>
            <p className="text-xs text-slate-500 mb-6">
              Test automated voice workflows for appointment scheduling, lead qualification, ticket escalation, and document search.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Card 1: Voice Appointment Booking */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-800/40 dark:to-slate-900 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-blue-600">
                  <Calendar size={18} />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Voice Appointment Booking</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Allows callers or team members to speak dates and times to reserve demo calls and sync with Google Calendar.
                </p>
                <button
                  onClick={() => handleProcessVoiceInput('Schedule a product demo appointment for tomorrow at 2 PM')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Test "Book Appointment"
                </button>
              </div>

              {/* Card 2: Voice Lead Capture */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/40 dark:to-slate-900 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Users size={18} />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Voice Lead Capture</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Extracts company name, email address, and deal size directly from spoken voice notes into the CRM pipeline.
                </p>
                <button
                  onClick={() => handleProcessVoiceInput('Capture lead Acme Corp email contact@acme.com budget $25,000')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Test "Capture Lead"
                </button>
              </div>

              {/* Card 3: Support Ticket Escalation */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-800/40 dark:to-slate-900 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-amber-600">
                  <HelpCircle size={18} />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Voice Support Escalation</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Logs urgent customer issues over voice, assigns priority ratings, and routes notifications to engineering on-call.
                </p>
                <button
                  onClick={() => handleProcessVoiceInput('Create urgent support ticket for database sync error')}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Test "Escalate Ticket"
                </button>
              </div>

              {/* Card 4: Voice Document Knowledge Search */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-gradient-to-br from-purple-50/50 to-white dark:from-slate-800/40 dark:to-slate-900 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-purple-600">
                  <FileText size={18} />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Voice RAG Document Search</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Performs real-time semantic search over uploaded PDFs, SLAs, and technical manuals with spoken answers.
                </p>
                <button
                  onClick={() => handleProcessVoiceInput('Search documents for SLA refund policy and support response time')}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Test "Search Knowledge Base"
                </button>
              </div>

              {/* Card 5: Voice Workflow Trigger */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800/40 dark:to-slate-900 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Zap size={18} />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Voice Automation Workflow</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Triggers multi-step workflow automation sequences hands-free using voice phrases.
                </p>
                <button
                  onClick={() => handleProcessVoiceInput('Trigger workflow Inbound Lead Qualification Sequence')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Test "Run Workflow"
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: Shortcuts Directory */}
      {activeTab === 'shortcuts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Voice Command Shortcuts</h3>
              <p className="text-xs text-slate-500">Pre-programmed phrases recognized by the Enterprise Voice Assistant</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((sc) => (
              <div
                key={sc.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                      {sc.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{sc.phrase}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{sc.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 italic">e.g. "{sc.example}"</span>
                  <button
                    onClick={() => {
                      setActiveTab('conversation');
                      handleProcessVoiceInput(sc.example);
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Execute Phrase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: Audio & Voice Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Enterprise Voice Configuration & Privacy</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Column 1: Speech-To-Text Language */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe size={16} className="text-blue-600" />
                Language & Input Recognition
              </h4>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Recognition Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="es-ES">Spanish (Spain)</option>
                  <option value="fr-FR">French (France)</option>
                  <option value="de-DE">German (Germany)</option>
                  <option value="ja-JP">Japanese (Japan)</option>
                  <option value="zh-CN">Chinese (Mandarin)</option>
                  <option value="pt-BR">Portuguese (Brazil)</option>
                  <option value="it-IT">Italian (Italy)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Noise Cancellation & Filtering</span>
                  <p className="text-[10px] text-slate-400">Filters background ambient noise using Web Audio Gain filters</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.noiseReduction}
                  onChange={(e) => setSettings({ ...settings, noiseReduction: e.target.checked })}
                  className="accent-blue-600 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Auto Confirm Business Actions</span>
                  <p className="text-[10px] text-slate-400">Instantly executes appointments and tickets without asking for manual click</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoConfirmBusinessActions}
                  onChange={(e) => setSettings({ ...settings, autoConfirmBusinessActions: e.target.checked })}
                  className="accent-blue-600 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            {/* Column 2: Security & Privacy */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                Security & Voice Data Protection
              </h4>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Shield size={16} />
                  <span>Encrypted In-Memory Processing</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Voice audio buffer is processed strictly in-memory and discarded immediately after transcription. No raw audio recordings are stored on server disk.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Screen Reader Accessibility Captions</span>
                  <p className="text-[10px] text-slate-400">Renders high-contrast subtitles for voice audio output</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.screenReaderCaptions}
                  onChange={(e) => setSettings({ ...settings, screenReaderCaptions: e.target.checked })}
                  className="accent-blue-600 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
