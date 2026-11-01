/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Siren,
  Flame,
  HeartPulse,
  Wrench,
  FileText,
  AlertOctagon,
} from 'lucide-react';

interface EscalationActionsProps {
  language: 'fr' | 'en';
  selectedAction: string | null;
  onSelectAction: (action: string) => void;
  onEvaluateAndEnd: () => void;
  isEvaluating: boolean;
  callStatus: 'IDLE' | 'DIALING' | 'RINGING' | 'CONNECTED' | 'ENDED';
}

export const EscalationActions: React.FC<EscalationActionsProps> = ({
  language,
  selectedAction,
  onSelectAction,
  onEvaluateAndEnd,
  isEvaluating,
  callStatus,
}) => {
  const isFr = language === 'fr';

  const actions = [
    {
      id: 'CANCEL_VERIFIED',
      label: isFr ? 'Annuler Alarme (Code Valide)' : 'Abort Alarm (Valid Passcode)',
      desc: isFr ? 'Fausse alerte avérée avec mot de passe conforme.' : 'Verified false alarm with valid verbal password.',
      icon: CheckCircle2,
      color: 'border-emerald-600/40 hover:bg-emerald-950/30 text-emerald-300',
      activeColor: 'bg-emerald-900/60 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30',
    },
    {
      id: 'DISPATCH_GUARD',
      label: isFr ? 'Refus & Patrouille Gardiennage' : 'Deny Abort & Dispatch Patrol',
      desc: isFr ? 'Mot de passe erroné, absent, ou doute sur l\'appelant.' : 'Invalid/missing passcode or suspicious caller.',
      icon: ShieldCheck,
      color: 'border-amber-600/40 hover:bg-amber-950/30 text-amber-300',
      activeColor: 'bg-amber-900/60 border-amber-500 text-amber-200 ring-2 ring-amber-500/30',
    },
    {
      id: 'DISPATCH_POLICE',
      label: isFr ? 'Déclencher Police 17 (Effraction)' : 'Dispatch Police 17 (Burglary)',
      desc: isFr ? 'Effraction avérée, intrusion confirmée, bris de vitre.' : 'Confirmed intrusion, break-in or glassbreak audio.',
      icon: Siren,
      color: 'border-blue-600/40 hover:bg-blue-950/30 text-blue-300',
      activeColor: 'bg-blue-900/60 border-blue-500 text-blue-200 ring-2 ring-blue-500/30',
    },
    {
      id: 'SILENT_DURESS_POLICE',
      label: isFr ? 'Alerte Discrète Contrainte (Otage)' : 'Silent Duress Dispatch (Hostage)',
      desc: isFr ? 'Code de contrainte donné : Police immédiate sans alerter l\'intrus.' : 'Duress code stated: Silent priority police response.',
      icon: AlertOctagon,
      color: 'border-red-600/40 hover:bg-red-950/30 text-red-300',
      activeColor: 'bg-red-900/60 border-red-500 text-red-200 ring-2 ring-red-500/30',
    },
    {
      id: 'DISPATCH_FIRE',
      label: isFr ? 'Déclencher Pompiers 18 / 112' : 'Dispatch Fire Brigade (18/112)',
      desc: isFr ? 'Incendie confirmé, sprinklers en débit, panique fumée.' : 'Confirmed fire, waterflow sprinkler, or heavy smoke.',
      icon: Flame,
      color: 'border-orange-600/40 hover:bg-orange-950/30 text-orange-300',
      activeColor: 'bg-orange-900/60 border-orange-500 text-orange-200 ring-2 ring-orange-500/30',
    },
    {
      id: 'MEDICAL_SAMU',
      label: isFr ? 'Déclencher SAMU 15 / 112' : 'Dispatch Medical Services (SAMU)',
      desc: isFr ? 'Chute senior, travailleur isolé blessé, malaise.' : 'Senior fall, injured lone worker, medical distress.',
      icon: HeartPulse,
      color: 'border-pink-600/40 hover:bg-pink-950/30 text-pink-300',
      activeColor: 'bg-pink-900/60 border-pink-500 text-pink-200 ring-2 ring-pink-500/30',
    },
    {
      id: 'MAINTENANCE_LOG',
      label: isFr ? 'Journaliser Incident Technique' : 'Log Technical Maintenance Alert',
      desc: isFr ? 'Chambre froide, sabotage ligne, dérive capteur.' : 'Freezer temp drift, sabotage line or sensor fault.',
      icon: Wrench,
      color: 'border-slate-600/40 hover:bg-slate-800 text-slate-300',
      activeColor: 'bg-slate-800 border-slate-400 text-white ring-2 ring-slate-400/30',
    },
  ];

  return (
    <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200">
      <div className="border-b border-slate-800 pb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {isFr ? 'Décision d\'Escalade & Clôture' : 'Escalation & Resolution'}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {isFr
            ? 'Sélectionnez la mesure opérationnelle appropriée selon les règles Chubb.'
            : 'Select appropriate operational measure following Chubb guidelines.'}
        </p>
      </div>

      {/* Action buttons list */}
      <div className="space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          const isSelected = selectedAction === act.id;
          return (
            <button
              key={act.id}
              onClick={() => onSelectAction(act.id)}
              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${
                isSelected ? act.activeColor : `bg-slate-950/60 ${act.color}`
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-100">{act.label}</div>
                <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{act.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Evaluate & End Button */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={onEvaluateAndEnd}
          disabled={isEvaluating}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>
            {isEvaluating
              ? isFr
                ? 'Génération de l\'audit en cours...'
                : 'Auditing call performance...'
              : isFr
              ? 'Conclure & Lancer l\'Audit'
              : 'End & Run AAR Audit'}
          </span>
        </button>
        <p className="text-[10px] text-slate-500 text-center mt-1.5">
          {isFr
            ? 'Génère le rapport d\'intervention et la note de conformité (/100).'
            : 'Generates procedural debriefing and compliance score (/100).'}
        </p>
      </div>
    </div>
  );
};
