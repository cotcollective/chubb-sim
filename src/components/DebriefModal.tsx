/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, RotateCcw, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface CheckItem {
  name: string;
  status: 'pass' | 'fail' | 'warning' | string;
  points: number;
  maxPoints: number;
  notes: string;
}

interface EvaluationResult {
  score: number;
  passed: boolean;
  verdict: string;
  checks: CheckItem[];
  criticalBreaches: string[];
  debriefingNotes: string;
}

interface DebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationResult | null;
  language: 'fr' | 'en';
  onRestart: () => void;
  onNextScenario: () => void;
}

export const DebriefModal: React.FC<DebriefModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  language,
  onRestart,
  onNextScenario,
}) => {
  const isFr = language === 'fr';

  if (!isOpen || !evaluation) return null;

  const scoreColor =
    evaluation.score >= 80
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
      : evaluation.score >= 65
      ? 'text-amber-400 border-amber-500/40 bg-amber-950/40'
      : 'text-rose-400 border-rose-500/40 bg-rose-950/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm tracking-tight text-white uppercase">
              {isFr ? 'Rapport d\'Audit & Débriefing Intervention' : 'After-Action Quality Audit'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Score & Verdict Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-950/70">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                {isFr ? 'Verdict Opérationnel' : 'Operational Verdict'}
              </div>
              <div className="text-base font-extrabold text-white mt-0.5">
                {evaluation.verdict}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {evaluation.passed
                  ? isFr
                    ? 'Conforme aux exigences de la certification de sécurité Chubb ARC.'
                    : 'Complies with Chubb ARC operational standards.'
                  : isFr
                  ? 'Non conforme : des erreurs de procédure ou de sécurité ont été relevées.'
                  : 'Non-compliant: procedural or security failures detected.'}
              </div>
            </div>

            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border ${scoreColor}`}>
              <span className="text-2xl font-black font-mono tabular-nums leading-none">
                {evaluation.score}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">
                / 100
              </span>
            </div>
          </div>

          {/* Critical Security Breaches (if any) */}
          {evaluation.criticalBreaches && evaluation.criticalBreaches.length > 0 && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl space-y-1.5 text-xs text-rose-200">
              <div className="font-bold flex items-center gap-2 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  {isFr
                    ? 'INFRACTIONS CRITIQUES DE SÉCURITÉ CONSTATÉES'
                    : 'CRITICAL SECURITY BREACHES DETECTED'}
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-rose-300/90">
                {evaluation.criticalBreaches.map((breach, idx) => (
                  <li key={idx}>{breach}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist Audit Items */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              {isFr ? 'Grille d\'Évaluation des Procédures' : 'Procedural Audit Rubric'}
            </div>
            <div className="space-y-2 text-xs">
              {evaluation.checks.map((check, idx) => {
                const isPass = check.status === 'pass';
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      {isPass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold text-slate-200">{check.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {check.notes}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-xs font-bold text-slate-300 shrink-0 tabular-nums">
                      {check.points} / {check.maxPoints} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructor Feedback */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              {isFr ? 'Recommandations du Formateur' : 'Instructor Debriefing Feedback'}
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              {evaluation.debriefingNotes}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isFr ? 'Rejouer ce scénario' : 'Replay Scenario'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNextScenario();
            }}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <span>{isFr ? 'Scénario Suivant' : 'Next Scenario'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
