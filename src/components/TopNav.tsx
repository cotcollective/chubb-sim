/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, BookOpen, ListFilter, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface TopNavProps {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  onOpenScenarios: () => void;
  onOpenProcedures: () => void;
  onResetCall: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  language,
  setLanguage,
  audioMuted,
  setAudioMuted,
  onOpenScenarios,
  onOpenProcedures,
  onResetCall,
}) => {
  const isFr = language === 'fr';

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
          <Shield className="w-4 h-4" />
        </div>
        <a href="/" className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          CHUBB <span className="text-red-500 font-extrabold">ARC</span> SIMULATOR
        </a>
      </div>

      {/* Zone 2: 4 clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={onOpenScenarios}
          className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap"
        >
          <ListFilter className="w-4 h-4 text-slate-400" />
          <span>{isFr ? '15 Scénarios' : '15 Scenarios'}</span>
        </button>
        <button
          onClick={onOpenProcedures}
          className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>{isFr ? 'Procédures Opérateur' : 'ARC Procedures'}</span>
        </button>
        <button
          onClick={onResetCall}
          className="flex items-center gap-2 hover:text-white transition-colors whitespace-nowrap text-slate-300"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>{isFr ? 'Réinitialiser Appel' : 'Reset Call'}</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action cluster */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setAudioMuted(!audioMuted)}
          className={`p-2 rounded-lg border transition-colors ${
            audioMuted
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={audioMuted ? (isFr ? 'Son coupé' : 'Audio muted') : (isFr ? 'Son activé' : 'Audio on')}
        >
          {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="flex items-center rounded-lg bg-slate-800/80 p-0.5 border border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setLanguage('fr')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              language === 'fr'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              language === 'en'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
};
