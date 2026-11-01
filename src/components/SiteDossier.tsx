/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, MapPin, Phone, KeyRound, AlertTriangle, CheckCircle2, XCircle, User, Cpu } from 'lucide-react';
import { Scenario, Persona } from '../data/scenarios.ts';

interface SiteDossierProps {
  scenario: Scenario;
  persona: Persona;
  language: 'fr' | 'en';
  checklistState: {
    stationAnnounced: boolean;
    nonDisclosureRespected: boolean;
    passcodeAsked: boolean;
    passcodeVerified: boolean;
    duressDetected: boolean;
  };
  onOpenPersonaSelector: () => void;
  onOpenScenarioSelector: () => void;
}

export const SiteDossier: React.FC<SiteDossierProps> = ({
  scenario,
  persona,
  language,
  checklistState,
  onOpenPersonaSelector,
  onOpenScenarioSelector,
}) => {
  const isFr = language === 'fr';

  const priorityColor = {
    'P1-CRITICAL': 'bg-red-500/20 text-red-400 border-red-500/40',
    'P2-HIGH': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    'P3-MEDIUM': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    'P4-LOW': 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  }[scenario.priority];

  return (
    <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200">
      {/* Alarm CAD Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-100">
            {scenario.code}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${priorityColor}`}>
            {scenario.priority}
          </span>
        </div>
        <button
          onClick={onOpenScenarioSelector}
          className="text-xs font-semibold text-red-400 hover:text-red-300 underline underline-offset-4"
        >
          {isFr ? 'Changer Scénario' : 'Change Scenario'}
        </button>
      </div>

      {/* Scenario Title & Summary */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">
          {scenario.title[language]}
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {scenario.summary[language]}
        </p>
      </div>

      {/* Triggered Zone Alert Box */}
      <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-3 text-xs">
        <div className="flex items-center justify-between font-mono text-[11px] text-red-300 font-bold mb-1">
          <span>{isFr ? 'ZONE DÉCLENCHÉE' : 'TRIGGERED ZONE'}</span>
          <span>{scenario.siteInfo.alarmTriggerTime} UTC+1</span>
        </div>
        <div className="font-semibold text-white">
          {scenario.siteInfo.activeZone}
        </div>
        <div className="text-[11px] text-red-200/80 mt-1">
          {scenario.siteInfo.zoneDescription[language]}
        </div>
        <div className="mt-2 pt-2 border-t border-red-900/60 text-[11px] text-amber-300 font-medium flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>
            {isFr
              ? 'RÈGLE DE CONFIDENTIALITÉ : Ne jamais divulguer le nom ou l\'emplacement de cette zone à l\'appelant avant mot de passe vérifié !'
              : 'NON-DISCLOSURE MANDATE: Never disclose this zone name or location to the caller before verifying secret passcode!'}
          </span>
        </div>
      </div>

      {/* Subscriber & Location Record */}
      <div className="space-y-2.5 text-xs border-t border-slate-800 pt-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">{scenario.siteInfo.siteName}</div>
            <div className="text-slate-400">{scenario.siteInfo.siteAddress}</div>
            <div className="font-mono text-[11px] text-slate-500">N° {scenario.siteInfo.accountNumber}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="font-mono text-slate-200">{scenario.siteInfo.phone}</div>
          <span className="text-slate-500">({scenario.siteInfo.customerName})</span>
        </div>

        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="text-slate-300">{scenario.siteInfo.systemType}</div>
        </div>
      </div>

      {/* Security Dossier (Passcodes) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>{isFr ? 'DOSSIER SÉCURITÉ CLIENT' : 'SECURITY PASSCODE DOSSIER'}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
          <div className="bg-slate-900 border border-slate-800 rounded p-2">
            <span className="text-[10px] text-slate-400 block uppercase">
              {isFr ? 'Mot de passe normal' : 'Primary Passcode'}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {scenario.siteInfo.primaryPasscode}
            </span>
          </div>

          <div className="bg-red-950/30 border border-red-900/50 rounded p-2">
            <span className="text-[10px] text-red-300 block uppercase">
              {isFr ? 'Code de contrainte' : 'Silent Duress Code'}
            </span>
            <span className="text-xs font-bold text-red-400">
              {scenario.siteInfo.duressPasscode}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          {scenario.siteInfo.specialInstructions[language]}
        </p>
      </div>

      {/* Persona Info */}
      <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
              <span>{persona.name}</span>
              <span className="text-[11px] text-slate-400">({persona.age} ans)</span>
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-1">{persona.role[language]}</div>
          </div>
        </div>
        <button
          onClick={onOpenPersonaSelector}
          className="text-xs text-red-400 hover:text-red-300 underline font-medium"
        >
          {isFr ? 'Changer' : 'Switch'}
        </button>
      </div>

      {/* Live Procedural Checklist */}
      <div className="border-t border-slate-800 pt-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          {isFr ? 'Contrôle Procédural en Direct' : 'Live Procedural Status'}
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">
              {isFr ? '1. Identification Station Chubb' : '1. Announce Chubb Station'}
            </span>
            {checklistState.stationAnnounced ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> OK
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <XCircle className="w-3.5 h-3.5" /> {isFr ? 'Attente' : 'Pending'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">
              {isFr ? '2. Règle de Non-Divulgation' : '2. Non-Disclosure Intact'}
            </span>
            {checklistState.nonDisclosureRespected ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> {isFr ? 'Respectée' : 'Compliant'}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" /> {isFr ? 'Rompu !' : 'Breached!'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">
              {isFr ? '3. Mot de passe exigé' : '3. Passcode Requested'}
            </span>
            {checklistState.passcodeAsked ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> {checklistState.passcodeVerified ? (isFr ? 'Validé' : 'Verified') : (isFr ? 'Demandé' : 'Asked')}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                <XCircle className="w-3.5 h-3.5" /> {isFr ? 'Non vérifié' : 'Unchecked'}
              </span>
            )}
          </div>

          {checklistState.duressDetected && (
            <div className="p-2 bg-red-950/80 border border-red-500 rounded text-red-200 text-xs font-bold animate-pulse flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                {isFr
                  ? 'CODE DE CONTRAINTE DÉTECTÉ : Agissez normalement et déclenchez Police discrète !'
                  : 'DURESS CODE DETECTED: Act normal and trigger silent police dispatch!'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
