'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Bot,
  User,
  Clock,
  Volume2,
  VolumeX,
  Send,
  FileCheck,
  ShieldCheck,
  MessageSquare,
  Award,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
  sender: 'AI' | 'STUDENT';
  messageText: string;
}

export default function MockInterviewPage() {
  // Session setup states
  const [sessionActive, setSessionActive] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState('Frontend Developer Intern');
  const [primarySkill, setPrimarySkill] = useState('React');
  const [transcriptConsent, setTranscriptConsent] = useState(true);

  // Active call media states
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAiMuted, setIsAiMuted] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [micAudioLevel, setMicAudioLevel] = useState(0);

  // Video elements refs
  const candidateVideoRef = useRef<HTMLVideoElement | null>(null);
  const lobbyVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Speech & AI state
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestAiMessage, setLatestAiMessage] = useState('');
  const [studentLiveTranscript, setStudentLiveTranscript] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions] = useState(5);
  const [callDuration, setCallDuration] = useState(0);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Speech recognition ref
  const recognitionRef = useRef<any>(null);

  // Evaluation states
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Initialize User Media (Camera & Mic) for Lobby & Call
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });

          setMediaStream(stream);

          if (lobbyVideoRef.current) {
            lobbyVideoRef.current.srcObject = stream;
          }

          // Setup Audio Analyser for mic level
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              audioContextRef.current = audioCtx;
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 64;
              source.connect(analyser);
              analyserRef.current = analyser;

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const checkVolume = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
                animationFrameRef.current = requestAnimationFrame(checkVolume);
              };
              checkVolume();
            }
          } catch (audioErr) {
            console.warn('Audio metering unavailable:', audioErr);
          }
        }
      } catch (err) {
        console.warn('Camera/mic access was not granted or not available:', err);
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Bind video element when in active call
  useEffect(() => {
    if (sessionActive && candidateVideoRef.current && mediaStream) {
      candidateVideoRef.current.srcObject = mediaStream;
    }
  }, [sessionActive, mediaStream]);

  // Call timer
  useEffect(() => {
    if (!sessionActive || isCompleted || evaluation) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionActive, isCompleted, evaluation]);

  // 2. Initialize Speech-to-Text (SpeechRecognition)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            interimTranscript += event.results[i][0].transcript;
          }
          if (interimTranscript.trim()) {
            setStudentLiveTranscript(interimTranscript);
            setIsCandidateSpeaking(true);
          }
        };

        recog.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsCandidateSpeaking(false);
        };

        recog.onend = () => {
          setIsCandidateSpeaking(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

  // 3. Text-to-Speech (AI Speaking Vocally)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || isAiMuted) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const cleanText = text.replace(/[*_#`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      // Select natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onstart = () => {
        setIsAiSpeaking(true);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch {}
        }
      };

      utterance.onend = () => {
        setIsAiSpeaking(false);
        // Automatically start listening after AI finishes speaking
        startListening();
      };

      utterance.onerror = () => {
        setIsAiSpeaking(false);
        startListening();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
      setIsAiSpeaking(false);
    }
  };

  const startListening = () => {
    if (!isMicOn || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsCandidateSpeaking(true);
    } catch {}
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsCandidateSpeaking(false);
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        if (!audioTrack.enabled) {
          stopListening();
        } else {
          startListening();
        }
      }
    }
  };

  // 4. Start Video Interview Session
  const handleStartCall = async () => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const res = await api.post('/interviews/start', {
        targetRole,
        primarySkill,
        transcriptConsent,
      });

      const data = res.data.data;
      setInterviewId(data.interviewId);
      setSessionActive(true);
      setCurrentQuestionNumber(1);
      setLatestAiMessage(data.firstMessage);
      setMessages([{ sender: 'AI', messageText: data.firstMessage }]);

      // Speak initial greeting and first question
      speakText(data.firstMessage);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to connect to AI Video Interview server');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Send Candidate Answer (Voice or Typed)
  const handleSubmitResponse = async (explicitText?: string) => {
    const answer = (explicitText || studentLiveTranscript || textInput).trim();
    if (!answer || !interviewId || isProcessing) return;

    stopListening();
    setIsProcessing(true);
    setStudentLiveTranscript('');
    setTextInput('');
    setErrorMsg(null);

    const updatedMessages: Message[] = [
      ...messages,
      { sender: 'STUDENT', messageText: answer },
    ];
    setMessages(updatedMessages);

    try {
      const res = await api.post(`/interviews/${interviewId}/message`, {
        messageText: answer,
      });

      const data = res.data.data;
      const aiReply = data.replyText;

      setLatestAiMessage(aiReply);
      setMessages([...updatedMessages, { sender: 'AI', messageText: aiReply }]);

      if (data.isCompleted) {
        setIsCompleted(true);
        speakText(aiReply);
      } else {
        setCurrentQuestionNumber(data.questionNumber || currentQuestionNumber + 1);
        speakText(aiReply);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to submit voice answer');
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // 6. Conclude & Generate Comprehensive Scorecard
  const handleEndCallAndEvaluate = async () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    stopListening();

    if (!interviewId) return;
    setIsEvaluating(true);
    setErrorMsg(null);

    try {
      const res = await api.post(`/interviews/${interviewId}/evaluate`);
      setEvaluation(res.data.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to generate technical evaluation scorecard');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    setSessionActive(false);
    setInterviewId(null);
    setMessages([]);
    setLatestAiMessage('');
    setStudentLiveTranscript('');
    setIsCompleted(false);
    setEvaluation(null);
    setCallDuration(0);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // VIEW 1: POST-INTERVIEW COMPREHENSIVE SCORECARD
  // =========================================================================
  if (evaluation) {
    return (
      <div className="flex-1 flex bg-slate-50 min-h-screen">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-card text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Evaluation Complete
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Technical Interview Scorecard: {targetRole}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                Evaluated against industry rubrics across technical depth, problem solving, and spoken articulation.
              </p>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 max-w-3xl mx-auto">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Technical Knowledge
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                  {Math.round(evaluation.knowledgeScore)}%
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Problem Solving
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                  {Math.round(evaluation.problemSolvingScore)}%
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  Spoken Delivery
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                  {Math.round(evaluation.communicationScore)}%
                </span>
              </div>

              <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200 text-center">
                <span className="text-xs text-brand-700 font-semibold uppercase tracking-wider block">
                  Overall Score
                </span>
                <span className="text-2xl sm:text-3xl font-black text-brand-900 mt-1 block">
                  {Math.round(evaluation.overallScore)}/100
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1.5" /> Practice Another Role
              </Button>
              <Button href="/student/recommendations">
                View Matched Internships <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Detailed Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Key Strengths
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                {evaluation.strengths?.map((str: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">
                    {str}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Recommended Growth Areas
              </h3>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                {evaluation.improvementAreas?.map((imp: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-600" />
              Executive AI Interview Summary
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {evaluation.executiveSummary}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE AI VIDEO CALL INTERFACE (IMMERSIVE GOOGLE MEET STYLE)
  // =========================================================================
  if (sessionActive) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white select-none">
        {/* Top Video Header */}
        <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Video Interview
            </span>
            <span className="hidden sm:inline text-xs text-slate-500">•</span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">
              {targetRole} ({primarySkill})
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-md text-emerald-400 border border-slate-700">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(callDuration)}</span>
            </div>

            <span className="bg-brand-900/80 text-brand-300 px-2.5 py-1 rounded-md border border-brand-700 font-semibold">
              Question {currentQuestionNumber} of {totalQuestions}
            </span>
          </div>
        </header>

        {/* Video Stage: 2-Tile Grid */}
        <div className="flex-1 p-3 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto w-full overflow-hidden">
          {/* Tile 1: AI Interviewer Video Tile */}
          <div className="relative rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
            {/* Ambient Speaking Glow */}
            <div
              className={clsx(
                'absolute inset-0 bg-radial transition-opacity duration-700 pointer-events-none',
                isAiSpeaking
                  ? 'opacity-30 from-purple-600/40 via-transparent to-transparent'
                  : 'opacity-0'
              )}
            />

            {/* AI Avatar & Audio Visualizer */}
            <div className="relative flex flex-col items-center justify-center">
              <div
                className={clsx(
                  'w-32 h-32 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl',
                  isAiSpeaking
                    ? 'ring-4 ring-purple-500/80 ring-offset-4 ring-offset-slate-900 scale-105 bg-gradient-to-tr from-purple-700 via-indigo-600 to-brand-500'
                    : 'bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-slate-600'
                )}
              >
                <Bot className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
              </div>

              {/* Real-time Voice Waveform Animation when AI Speaks */}
              {isAiSpeaking ? (
                <div className="flex items-center gap-1 mt-4 h-6">
                  {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-purple-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              ) : isProcessing ? (
                <div className="flex items-center gap-1.5 mt-4 text-xs text-amber-400 font-semibold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" /> Analyzing candidate response...
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" /> Listening to you
                </div>
              )}
            </div>

            {/* AI Tile Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-semibold text-slate-200">
                  Dr. Sarah Vance • AI Lead Interviewer
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsAiMuted(!isAiMuted)}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-standard"
                title={isAiMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              >
                {isAiMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tile 2: Candidate Live Webcam Tile */}
          <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            {isCameraOn ? (
              <video
                ref={candidateVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-28 h-28 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <User className="w-12 h-12" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Camera is disabled</span>
              </div>
            )}

            {/* Candidate Live Audio Meter & Subtitles Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
              <User className="w-3.5 h-3.5 text-brand-400" />
              <span>You (Candidate)</span>
              {isMicOn && (
                <div className="flex items-center gap-0.5 ml-2 h-3">
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(20, micAudioLevel)}%` }}
                  />
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(15, micAudioLevel * 0.8)}%` }}
                  />
                  <span
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(25, micAudioLevel * 1.1)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Candidate Live Subtitles Overlay */}
            {(studentLiveTranscript || isCandidateSpeaking) && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur p-3 rounded-2xl border border-slate-800 text-xs text-emerald-300 animate-in fade-in">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block mb-0.5">
                  Speaking Live:
                </span>
                <p className="line-clamp-2 italic">
                  "{studentLiveTranscript || 'Listening...'}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Closed Captions: Latest Question Display */}
        <div className="px-4 sm:px-6 max-w-5xl mx-auto w-full pb-2">
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-0.5">
                Current Question:
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {latestAiMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Text Fallback Drawer (If candidate wants to type response) */}
        {showTextFallback && (
          <div className="px-4 sm:px-6 max-w-5xl mx-auto w-full pb-2 animate-in slide-in-from-bottom-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitResponse(textInput);
              }}
              className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800"
            >
              <input
                type="text"
                placeholder="Type your technical response here if microphone is noisy..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white focus:outline-none placeholder-slate-500"
              />
              <Button type="submit" size="sm" isLoading={isProcessing}>
                <Send className="w-3.5 h-3.5 mr-1" /> Send
              </Button>
            </form>
          </div>
        )}

        {/* Video Controls Bar */}
        <footer className="h-20 bg-slate-900 border-t border-slate-800 px-4 sm:px-8 flex items-center justify-between shrink-0">
          {/* Left Controls: Media Toggles */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleMic}
              className={clsx(
                'p-3 rounded-2xl transition-standard border cursor-pointer',
                isMicOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-rose-600 text-white border-rose-500'
              )}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={clsx(
                'p-3 rounded-2xl transition-standard border cursor-pointer',
                isCameraOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  : 'bg-rose-600 text-white border-rose-500'
              )}
              title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowTextFallback(!showTextFallback)}
              className={clsx(
                'p-3 rounded-2xl transition-standard border cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-semibold',
                showTextFallback
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              )}
              title="Toggle Text Input Fallback"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Type Mode</span>
            </button>
          </div>

          {/* Center Action: Submit Spoken Response */}
          <div className="flex items-center gap-3">
            <Button
              size="md"
              disabled={isProcessing || (!studentLiveTranscript && !textInput)}
              isLoading={isProcessing}
              onClick={() => handleSubmitResponse()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30 px-6 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit Spoken Response
            </Button>
          </div>

          {/* Right Action: End Call & Score */}
          <div>
            <button
              type="button"
              onClick={handleEndCallAndEvaluate}
              disabled={isEvaluating}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition-standard cursor-pointer shadow-lg shadow-rose-900/30"
            >
              <PhoneOff className="w-4 h-4" />
              <span>{isEvaluating ? 'Evaluating...' : 'End & Score'}</span>
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: PRE-CALL LOBBY (WEBCAM & MIC CHECK BEFORE JOINING)
  // =========================================================================
  return (
    <div className="flex-1 flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Lobby Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AI Technical Video Interview
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Live Video Call
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Real-time video evaluation with vocal AI interviewer. Test your verbal communication and technical depth.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-Column Lobby Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Camera Mirror & Mic Level Check */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 aspect-video overflow-hidden shadow-card flex items-center justify-center">
              <video
                ref={lobbyVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Status pills over camera preview */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 text-emerald-400 border border-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  HD Camera Live
                </span>
              </div>

              {/* Live Mic Meter in Preview */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
                <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-75"
                    style={{ width: `${Math.max(5, micAudioLevel)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {micAudioLevel > 10 ? 'Audio OK' : 'Speak to test mic'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Interview Protocol & Anti-Cheat Standards
              </h4>
              <p className="leading-relaxed">
                Your video call will feature 5 technical and scenario questions spoken directly by our AI interviewer.
                Ensure good lighting and speak naturally into your microphone.
              </p>
            </div>
          </div>

          {/* Right Column: Role Setup & Launch Button */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Configure Video Interview
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Frontend Developer Intern">Frontend Developer Intern</option>
                <option value="Backend Systems Intern">Backend Systems Intern</option>
                <option value="Full Stack Engineer Intern">Full Stack Engineer Intern</option>
                <option value="AI & Machine Learning Intern">AI & Machine Learning Intern</option>
                <option value="DevOps & Cloud Intern">DevOps & Cloud Intern</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Assessment Skill
              </label>
              <select
                value={primarySkill}
                onChange={(e) => setPrimarySkill(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="React">React & Next.js</option>
                <option value="Node.js">Node.js & Express</option>
                <option value="Python">Python & Machine Learning</option>
                <option value="TypeScript">TypeScript & JavaScript</option>
                <option value="SQL">SQL & Database Systems</option>
                <option value="Docker">Docker & Cloud Containers</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transcriptConsent}
                  onChange={(e) => setTranscriptConsent(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 mt-0.5"
                />
                <span>
                  Allow automated multi-dimensional scoring on speech clarity and technical keywords.
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button
                onClick={handleStartCall}
                size="lg"
                isLoading={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 shadow-lg shadow-purple-900/20"
              >
                <Video className="w-5 h-5 mr-2" />
                Join AI Video Interview Call
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
