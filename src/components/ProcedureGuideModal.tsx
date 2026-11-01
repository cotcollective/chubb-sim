/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, ShieldAlert, KeyRound, AlertOctagon, PhoneForwarded, X } from 'lucide-react';

interface ProcedureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fr' | 'en';
}

export const ProcedureGuideModal: React.FC<ProcedureGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isFr = language === 'fr';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-red-500" />
            <span className="font-bold text-sm tracking-tight text-white uppercase">
              {isFr ? 'Manuel des Procédures Opérateur Chubb ARC' : 'Chubb ARC Operator Handbook'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-200">
          {/* Rule 1 */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{isFr ? 'Règle 1 : Formule d\'Accueil et Identification' : 'Rule 1: Salutation & Identification'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isFr
                ? 'L\'opérateur doit obligatoirement débuter la communication en annonçant : "Centre de télésurveillance Chubb, opérateur [N°/Nom], bonjour." Cette formule rassure l\'abonné légitime et signale à l\'intrus potentiel qu\'une levée de doute professionnelle est en cours.'
                : 'The operator must immediately state: "Chubb Monitoring Center, operator [ID/Name], hello." This authenticates the call for legitimate users and alerts unauthorized occupants.'}
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{isFr ? 'Règle 2 : La Règle d\'Or de Non-Divulgation' : 'Rule 2: The Golden Non-Disclosure Rule'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isFr
                ? 'INTERDICTION ABSOLUE de divulguer quelle zone a sonné, le type de capteur (volumétrique, bris de glace, coffre, fumée) ou l\'adresse exacte tant que l\'interlocuteur n\'a pas prouvé son identité avec le mot de passe secret verbal. Un cambrioleur cherchera toujours à savoir où se trouvent les capteurs pour s\'orienter dans les lieux.'
                : 'STRICT BAN on disclosing the triggered sensor, room location, safe status, or address before the caller verifies the confidential verbal passcode. Intruders phish for zone details to avoid detection.'}
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-4 bg-rose-950/30 border border-red-800/50 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>{isFr ? 'Règle 3 : Gestion du Code de Contrainte (Duress Code)' : 'Rule 3: Silent Duress Code Handling'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isFr
                ? 'Si le client prononce son mot de passe de contrainte (ex. "ORCHIDEE" ou "SILVER-9"), cela signifie qu\'il est sous la menace d\'un individu armé. NE JAMAIS lui dire que le code est faux ou qu\'il y a une erreur ! Rapprochez poliment la conversation ("Très bien, l\'annulation est enregistrée, bonne journée") puis déclenchez IMMÉDIATEMENT la Police secours (Code 10-33 Agression/Prise d\'otage).'
                : 'If the subscriber states their secret duress passcode, they are held hostage. NEVER state that the code is incorrect! Pretend everything is normal, politely terminate the call, and instantly dispatch emergency police priority 1 (Code 10-33).'}
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
              <PhoneForwarded className="w-4 h-4 shrink-0" />
              <span>{isFr ? 'Règle 4 : Critères d\'Escalade et d\'Annulation' : 'Rule 4: Escalation & Cancellation Criteria'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {isFr
                ? '• Annulation : Autorisée UNIQUEMENT si l\'interlocuteur donne le mot de passe verbal exact enregistré au dossier.\n• Refus : Si mot de passe erroné après 2 tentatives, ne pas polémiquer. Noter le refus et envoyer une patrouille de rondiers.\n• Incendie / Débit d\'eau : Déclencher les pompiers 18/112 dès confirmation ou doute avéré.'
                : '• Abort: Permitted ONLY when subscriber states exact registered passcode.\n• Deny Abort: If passcode is wrong or unknown, do not argue; dispatch patrol immediately.\n• Fire/Waterflow: Dispatch Fire Brigade (18/112) without delay upon confirmed smoke or waterflow.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {isFr ? 'Fermer le manuel' : 'Close Handbook'}
          </button>
        </div>
      </div>
    </div>
  );
};
