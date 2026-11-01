/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Send, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer.tsx';
import { Scenario, Persona } from '../data/scenarios.ts';

interface Message {
  id: string;
  sender: 'subscriber' | 'operator';
  text: string;
  timestamp: string;
}

interface CallConsoleProps {
  scenario: Scenario;
  persona: Persona;
  language: 'fr' | 'en';
  callStatus: 'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTED' | 'ENDED';
  messages: Message[];
  isSubscriberSpeaking: boolean;
  isOperatorTransmitting: boolean;
  onStartCall: () => void;
  onHangupCall: () => void;
  onOperatorSendText: (text: string) => void;
  onStartTransmitting: () => void;
  onStopTransmitting: () => void;
  onReplayAudio: (text: string) => void;
}

// Speech recognition type definitions
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export const CallConsole: React.FC<CallConsoleProps> = ({
  scenario,
  persona,
  language,
  callStatus,
  messages,
  isSubscriberSpeaking,
  isOperatorTransmitting,
  onStartCall,
  onHangupCall,
  onOperatorSendText,
  onStartTransmitting,
  onStopTransmitting,
  onReplayAudio,
}) => {
  const isFr = language === 'fr';
  const [manualInput, setManualInput] = useState('');
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [micSupported, setMicSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Call duration counter
  useEffect(() => {
    let timer: number;
    if (callStatus === 'CONNECTED') {
      timer = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubscriberSpeaking, speechTranscript]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setMicSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isFr ? 'fr-FR' : 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          currentText += transcript;
        }
        setSpeechTranscript(currentText);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setSpeechError(event.error);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not initialize speech recognition:', e);
      setMicSupported(false);
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [isFr]);

  // Spacebar push-to-talk handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        callStatus === 'CONNECTED' &&
        !isOperatorTransmitting &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        handleStartPushToTalk();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        isOperatorTransmitting &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        handleStopPushToTalk();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [callStatus, isOperatorTransmitting, speechTranscript]);

  const handleStartPushToTalk = () => {
    if (callStatus !== 'CONNECTED') return;
    setSpeechError(null);
    setSpeechTranscript('');
    onStartTransmitting();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // May already be active
      }
    }
  };

  const handleStopPushToTalk = () => {
    if (!isOperatorTransmitting) return;
    onStopTransmitting();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    // If speech was recorded, submit it
    const finalTrans = speechTranscript.trim();
    if (finalTrans) {
      onOperatorSendText(finalTrans);
      setSpeechTranscript('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim() || callStatus !== 'CONNECTED') return;
    onOperatorSendText(manualInput.trim());
    setManualInput('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Preset quick operator phrases
  const quickPhrases = isFr
    ? [
        'Centre de télésurveillance Chubb, opérateur 14, bonjour.',
        'Pouvez-vous me donner votre mot de passe verbal de sécurité ?',
        'Très bien, je note votre annulation, bonne journée.',
        'Avez-vous besoin d\'une assistance médicale ou des pompiers ?',
        'Restez en sécurité, une patrouille de vérification est envoyée.',
      ]
    : [
        'Chubb Monitoring Center, operator 14 speaking, hello.',
        'Could you please state your verbal security passcode?',
        'Understood, logging your cancellation, have a good day.',
        'Do you require emergency medical or fire assistance?',
        'Please remain safe, a verification patrol is on the way.',
      ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-slate-100">
      {/* CAD Telephony Line Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              callStatus === 'CONNECTED'
                ? 'bg-emerald-500 animate-pulse'
                : callStatus === 'RINGING' || callStatus === 'DIALING'
                ? 'bg-amber-400 animate-ping'
                : 'bg-slate-600'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold tracking-wider text-slate-200">
                {scenario.siteInfo.phone}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                ({scenario.siteInfo.customerName})
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span>
                {callStatus === 'CONNECTED'
                  ? isFr
                    ? 'LIGNE ACTIVE'
                    : 'LINE CONNECTED'
                  : callStatus === 'RINGING'
                  ? isFr
                    ? 'SONNERIE EN COURS...'
                    : 'RINGING SUBSCRIBER...'
                  : callStatus === 'DIALING'
                  ? isFr
                    ? 'COMPOSITION NUMÉRO...'
                    : 'DIALING...'
                  : isFr
                    ? 'CANAL EN ATTENTE'
                    : 'IDLE STANDBY'}
              </span>
              {callStatus === 'CONNECTED' && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {formatTime(callDuration)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Telephony Action Buttons */}
        <div className="flex items-center gap-2">
          {callStatus === 'IDLE' || callStatus === 'ENDED' ? (
            <button
              onClick={onStartCall}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isFr ? 'Lancer l\'Appel' : 'Dial Subscriber'}</span>
            </button>
          ) : (
            <button
              onClick={onHangupCall}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>{isFr ? 'Raccrocher' : 'Hang Up'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Audio Oscilloscope Strip */}
      <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800">
        <AudioVisualizer
          isSubscriberSpeaking={isSubscriberSpeaking}
          isOperatorTransmitting={isOperatorTransmitting}
          callConnected={callStatus === 'CONNECTED'}
        />
      </div>

      {/* Transcript & Conversation Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px] max-h-[380px] bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <PhoneCall className="w-8 h-8 mb-2 text-slate-600" />
            <p className="text-sm font-medium text-slate-400">
              {isFr
                ? 'Appel en attente de déclenchement'
                : 'Call waiting to be initiated'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {isFr
                ? 'Cliquez sur "Lancer l\'Appel" pour contacter le correspondant et démarrer l\'exercice.'
                : 'Click "Dial Subscriber" to ring the customer and start simulation.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOperator = msg.sender === 'operator';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isOperator ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                  <span className="font-semibold text-slate-300">
                    {isOperator
                      ? isFr
                        ? 'Opérateur Chubb'
                        : 'Chubb Operator'
                      : `${persona.name}`}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-[10px]">{msg.timestamp}</span>
                </div>
                <div
                  className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isOperator
                      ? 'bg-red-700/80 text-white rounded-br-xs'
                      : 'bg-slate-800/90 text-slate-100 rounded-bl-xs border border-slate-700/60'
                  }`}
                >
                  <p>{msg.text}</p>
                  {!isOperator && (
                    <button
                      onClick={() => onReplayAudio(msg.text)}
                      className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                      title={isFr ? 'Réécouter audio' : 'Replay audio'}
                    >
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                      <span>{isFr ? 'Réécouter' : 'Replay'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Live speech transcription preview */}
        {isOperatorTransmitting && (
          <div className="flex flex-col items-end">
            <div className="text-[11px] text-amber-400 mb-1 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              {isFr ? 'Transmission en cours...' : 'Transmitting live...'}
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2.5 text-xs bg-amber-950/60 border border-amber-600/50 text-amber-200 italic">
              {speechTranscript || (isFr ? 'Parlez maintenant dans votre micro...' : 'Speak into your microphone now...')}
            </div>
          </div>
        )}

        {isSubscriberSpeaking && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{persona.name} {isFr ? 'parle au téléphone...' : 'is speaking on line...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Phrase Prompts */}
      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800">
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFr ? 'Phrases types opérateur (clic pour envoyer)' : 'Operator preset phrases (click to send)'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => onOperatorSendText(phrase)}
              disabled={callStatus !== 'CONNECTED'}
              className="text-[11px] text-left px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 rounded-md border border-slate-700/80 transition-colors whitespace-nowrap"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Push-to-Talk Transmission Deck & Manual Text Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2.5">
        {speechError && (
          <div className="flex items-center gap-2 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-900/60 rounded p-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isFr
                ? `Microphone : ${speechError}. Vous pouvez également utiliser la saisie texte ci-dessous.`
                : `Microphone error: ${speechError}. You can also type below.`}
            </span>
          </div>
        )}

        {/* Big Push-To-Talk Button */}
        <div className="flex items-center justify-center">
          <button
            onMouseDown={handleStartPushToTalk}
            onMouseUp={handleStopPushToTalk}
            onTouchStart={handleStartPushToTalk}
            onTouchEnd={handleStopPushToTalk}
            disabled={callStatus !== 'CONNECTED'}
            className={`w-full max-w-md py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md transition-all select-none ${
              callStatus !== 'CONNECTED'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : isOperatorTransmitting
                ? 'bg-amber-600 text-white scale-[0.98] ring-4 ring-amber-500/30'
                : 'bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white'
            }`}
          >
            {isOperatorTransmitting ? (
              <>
                <Mic className="w-4 h-4 animate-pulse text-white" />
                <span>{isFr ? 'EN COURS D\'ÉMISSION... (REMETTRE POUR ENVOYER)' : 'TRANSMITTING... (RELEASE TO SEND)'}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>
                  {isFr
                    ? 'MAINTENEZ LE BOUTON MICRO (OU ESPACE) POUR PARLER'
                    : 'HOLD MICROPHONE BUTTON (OR SPACE) TO TRANSMIT'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Manual Text Fallback Bar */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            disabled={callStatus !== 'CONNECTED'}
            placeholder={
              callStatus !== 'CONNECTED'
                ? isFr
                  ? 'Ligne non connectée...'
                  : 'Call not active...'
                : isFr
                ? 'Ou tapez directement votre réponse ici...'
                : 'Or type your operator transmission here...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!manualInput.trim() || callStatus !== 'CONNECTED'}
            className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-lg transition-colors shrink-0"
            title={isFr ? 'Envoyer réponse' : 'Send message'}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
