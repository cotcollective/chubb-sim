/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TopNav } from './components/TopNav.tsx';
import { SiteDossier } from './components/SiteDossier.tsx';
import { CallConsole } from './components/CallConsole.tsx';
import { EscalationActions } from './components/EscalationActions.tsx';
import { ScenarioDrawer } from './components/ScenarioDrawer.tsx';
import { DebriefModal } from './components/DebriefModal.tsx';
import { ProcedureGuideModal } from './components/ProcedureGuideModal.tsx';
import { SCENARIOS, PERSONAS, Scenario, Persona } from './data/scenarios.ts';
import {
  playDTMF,
  startTelephoneRing,
  stopTelephoneRing,
  playPickupClick,
  playHangupTone,
  startAmbientSound,
  stopAmbientSound,
  speakText,
} from './utils/audioSystem.ts';

interface Message {
  id: string;
  sender: 'subscriber' | 'operator';
  text: string;
  timestamp: string;
}

export default function App() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS[0]);
  const [persona, setPersona] = useState<Persona>(PERSONAS[0]);
  const [callStatus, setCallStatus] = useState<'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubscriberSpeaking, setIsSubscriberSpeaking] = useState(false);
  const [isOperatorTransmitting, setIsOperatorTransmitting] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<string | null>(null);

  // Live procedural checklist state
  const [checklistState, setChecklistState] = useState({
    stationAnnounced: false,
    nonDisclosureRespected: true,
    passcodeAsked: false,
    passcodeVerified: false,
    duressDetected: false,
  });

  // Modals state
  const [scenarioDrawerOpen, setScenarioDrawerOpen] = useState(false);
  const [procedureModalOpen, setProcedureModalOpen] = useState(false);
  const [debriefModalOpen, setDebriefModalOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const speechCancelHandleRef = useRef<(() => void) | null>(null);

  // Sync persona when scenario changes
  const handleSelectScenario = (newScenario: Scenario) => {
    setScenario(newScenario);
    const matchedPersona = PERSONAS.find((p) => p.id === newScenario.defaultPersonaId) || PERSONAS[0];
    setPersona(matchedPersona);
    resetCallSession(newScenario, matchedPersona);
  };

  const handleSelectPersona = (newPersona: Persona) => {
    setPersona(newPersona);
    resetCallSession(scenario, newPersona);
  };

  const resetCallSession = (targetScenario = scenario, targetPersona = persona) => {
    stopTelephoneRing();
    stopAmbientSound();
    if (speechCancelHandleRef.current) {
      speechCancelHandleRef.current();
    }
    setCallStatus('IDLE');
    setMessages([]);
    setIsSubscriberSpeaking(false);
    setIsOperatorTransmitting(false);
    setSelectedEscalation(null);
    setChecklistState({
      stationAnnounced: false,
      nonDisclosureRespected: true,
      passcodeAsked: false,
      passcodeVerified: false,
      duressDetected: false,
    });
  };

  // Start Call Simulation
  const handleStartCall = () => {
    resetCallSession();
    setCallStatus('DIALING');

    // Dial tone
    playDTMF('0');
    setTimeout(() => playDTMF('4'), 120);
    setTimeout(() => playDTMF('7'), 240);
    setTimeout(() => playDTMF('2'), 360);

    // Transition to RINGING
    setTimeout(() => {
      setCallStatus('RINGING');
      if (!audioMuted) {
        startTelephoneRing();
      }

      // Transition to CONNECTED
      setTimeout(() => {
        stopTelephoneRing();
        if (!audioMuted) {
          playPickupClick();
          startAmbientSound(scenario.category);
        }
        setCallStatus('CONNECTED');

        // Subscriber opening greeting
        const opening = scenario.openingLine[language];
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          sender: 'subscriber',
          text: opening,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setMessages([newMsg]);

        // Speak opening line
        if (!audioMuted) {
          setIsSubscriberSpeaking(true);
          speechCancelHandleRef.current = speakText(
            opening,
            language,
            { ...persona.voice, gender: persona.gender },
            () => setIsSubscriberSpeaking(true),
            () => setIsSubscriberSpeaking(false)
          );
        }
      }, 3000);
    }, 1200);
  };

  const handleHangupCall = () => {
    stopTelephoneRing();
    stopAmbientSound();
    if (speechCancelHandleRef.current) {
      speechCancelHandleRef.current();
    }
    if (!audioMuted) {
      playHangupTone();
    }
    setCallStatus('ENDED');
    setIsSubscriberSpeaking(false);
    setIsOperatorTransmitting(false);
  };

  // Replay audio for a given message
  const handleReplayAudio = (text: string) => {
    if (audioMuted) return;
    if (speechCancelHandleRef.current) {
      speechCancelHandleRef.current();
    }
    setIsSubscriberSpeaking(true);
    speechCancelHandleRef.current = speakText(
      text,
      language,
      { ...persona.voice, gender: persona.gender },
      () => setIsSubscriberSpeaking(true),
      () => setIsSubscriberSpeaking(false)
    );
  };

  // Operator sends a text transmission (via voice transcription or typing)
  const handleOperatorSendText = async (text: string) => {
    if (callStatus !== 'CONNECTED' || !text.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const opMsg: Message = {
      id: `msg-op-${Date.now()}`,
      sender: 'operator',
      text: text.trim(),
      timestamp,
    };

    const updatedMessages = [...messages, opMsg];
    setMessages(updatedMessages);

    // Update Live Checklist locally
    const lower = text.toLowerCase();
    const announced =
      lower.includes('chubb') ||
      lower.includes('télésurveillance') ||
      lower.includes('monitoring') ||
      lower.includes('opérateur') ||
      lower.includes('operator');

    const askedCode =
      lower.includes('code') ||
      lower.includes('mot de passe') ||
      lower.includes('passcode') ||
      lower.includes('verbal') ||
      lower.includes('password');

    let breachedDisclosure = false;
    if (scenario.rules.forbidDisclosure && !checklistState.passcodeVerified) {
      const zoneKeywords = ['fumée', 'smoke', 'cuisine', 'kitchen', 'coffre', 'safe', 'sismique', 'seismic', 'trappe', 'hatch'];
      breachedDisclosure = zoneKeywords.some((k) => lower.includes(k));
    }

    setChecklistState((prev) => ({
      ...prev,
      stationAnnounced: prev.stationAnnounced || announced,
      passcodeAsked: prev.passcodeAsked || askedCode,
      nonDisclosureRespected: prev.nonDisclosureRespected && !breachedDisclosure,
    }));

    // Query AI for client reaction
    try {
      setIsSubscriberSpeaking(true);
      const res = await fetch('/api/call/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          personaId: persona.id,
          language,
          history: updatedMessages,
          operatorMessage: text.trim(),
        }),
      });

      const data = await res.json();
      const clientMsg: Message = {
        id: `msg-sub-${Date.now()}`,
        sender: 'subscriber',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      setMessages((prev) => [...prev, clientMsg]);

      // Update duress detection if duress word used
      if (data.isDuressWordUsed) {
        setChecklistState((prev) => ({ ...prev, duressDetected: true }));
      }

      // Check passcode verification
      if (data.passcodeMentioned) {
        const normalizedMention = data.passcodeMentioned.toLowerCase();
        const primaryCode = scenario.siteInfo.primaryPasscode.toLowerCase();
        if (normalizedMention.includes(primaryCode)) {
          setChecklistState((prev) => ({ ...prev, passcodeVerified: true }));
        }
      }

      // Speak client response
      if (!audioMuted) {
        speechCancelHandleRef.current = speakText(
          data.reply,
          language,
          { ...persona.voice, gender: persona.gender },
          () => setIsSubscriberSpeaking(true),
          () => setIsSubscriberSpeaking(false)
        );
      } else {
        setIsSubscriberSpeaking(false);
      }
    } catch (err) {
      console.error('Call respond error:', err);
      setIsSubscriberSpeaking(false);
    }
  };

  // Evaluate Call and Trigger Debrief
  const handleEvaluateAndEnd = async () => {
    setIsEvaluating(true);
    handleHangupCall();

    try {
      const res = await fetch('/api/call/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          language,
          history: messages,
          operatorActionTaken: selectedEscalation || 'NONE_SELECTED',
        }),
      });

      const result = await res.json();
      setEvaluationResult(result);
      setDebriefModalOpen(true);
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next scenario in list
  const handleNextScenario = () => {
    const currentIndex = SCENARIOS.findIndex((s) => s.id === scenario.id);
    const nextIndex = (currentIndex + 1) % SCENARIOS.length;
    handleSelectScenario(SCENARIOS[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <TopNav
        language={language}
        setLanguage={setLanguage}
        audioMuted={audioMuted}
        setAudioMuted={setAudioMuted}
        onOpenScenarios={() => setScenarioDrawerOpen(true)}
        onOpenProcedures={() => setProcedureModalOpen(true)}
        onResetCall={() => resetCallSession()}
      />

      {/* Main CAD Dispatch Console */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: CAD Site & Security Record (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <SiteDossier
            scenario={scenario}
            persona={persona}
            language={language}
            checklistState={checklistState}
            onOpenPersonaSelector={() => setScenarioDrawerOpen(true)}
            onOpenScenarioSelector={() => setScenarioDrawerOpen(true)}
          />
        </section>

        {/* Center Column: Live Audio Telephone Console (5 cols) */}
        <section className="lg:col-span-5 flex flex-col h-[760px]">
          <CallConsole
            scenario={scenario}
            persona={persona}
            language={language}
            callStatus={callStatus}
            messages={messages}
            isSubscriberSpeaking={isSubscriberSpeaking}
            isOperatorTransmitting={isOperatorTransmitting}
            onStartCall={handleStartCall}
            onHangupCall={handleHangupCall}
            onOperatorSendText={handleOperatorSendText}
            onStartTransmitting={() => setIsOperatorTransmitting(true)}
            onStopTransmitting={() => setIsOperatorTransmitting(false)}
            onReplayAudio={handleReplayAudio}
          />
        </section>

        {/* Right Column: Escalation Measures & Audit (3 cols) */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <EscalationActions
            language={language}
            selectedAction={selectedEscalation}
            onSelectAction={setSelectedEscalation}
            onEvaluateAndEnd={handleEvaluateAndEnd}
            isEvaluating={isEvaluating}
            callStatus={callStatus}
          />
        </section>
      </main>

      {/* Scenario & Persona Drawer */}
      <ScenarioDrawer
        isOpen={scenarioDrawerOpen}
        onClose={() => setScenarioDrawerOpen(false)}
        activeScenarioId={scenario.id}
        activePersonaId={persona.id}
        onSelectScenario={handleSelectScenario}
        onSelectPersona={handleSelectPersona}
        language={language}
      />

      {/* Operator Procedures Handbook Modal */}
      <ProcedureGuideModal
        isOpen={procedureModalOpen}
        onClose={() => setProcedureModalOpen(false)}
        language={language}
      />

      {/* Debrief & Evaluation Modal */}
      <DebriefModal
        isOpen={debriefModalOpen}
        onClose={() => setDebriefModalOpen(false)}
        evaluation={evaluationResult}
        language={language}
        onRestart={() => handleStartCall()}
        onNextScenario={handleNextScenario}
      />
    </div>
  );
}
