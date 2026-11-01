/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Search, Shield, User, Flame, Lock, AlertTriangle, HeartPulse, Wrench } from 'lucide-react';
import { SCENARIOS, PERSONAS, Scenario, Persona } from '../data/scenarios.ts';

interface ScenarioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: string;
  activePersonaId: string;
  onSelectScenario: (scenario: Scenario) => void;
  onSelectPersona: (persona: Persona) => void;
  language: 'fr' | 'en';
}

export const ScenarioDrawer: React.FC<ScenarioDrawerProps> = ({
  isOpen,
  onClose,
  activeScenarioId,
  activePersonaId,
  onSelectScenario,
  onSelectPersona,
  language,
}) => {
  const isFr = language === 'fr';
  const [tab, setTab] = useState<'scenarios' | 'personas'>('scenarios');
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categoryIcons: Record<string, typeof Flame> = {
    FIRE: Flame,
    INTRUSION: Lock,
    HOLDUP: AlertTriangle,
    DURESS: AlertTriangle,
    MEDICAL: HeartPulse,
    TECHNICAL: Wrench,
    TAMPER: Shield,
  };

  const filteredScenarios = SCENARIOS.filter((s) => {
    const matchesCategory = filter === 'ALL' || s.category === filter;
    const matchesSearch =
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.title[language].toLowerCase().includes(search.toLowerCase()) ||
      s.siteInfo.siteName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setTab('scenarios')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  tab === 'scenarios' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFr ? '15 Scénarios d\'Alarme' : '15 Alarm Scenarios'}
              </button>
              <button
                onClick={() => setTab('personas')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  tab === 'personas' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isFr ? '9 Personas Clients' : '9 Client Personas'}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'scenarios' ? (
          <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['ALL', 'FIRE', 'INTRUSION', 'DURESS', 'MEDICAL', 'TECHNICAL'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors ${
                      filter === cat
                        ? 'bg-slate-800 border-red-500 text-white font-bold'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'ALL'
                      ? isFr
                        ? 'Tous'
                        : 'All'
                      : cat === 'FIRE'
                      ? isFr
                        ? 'Incendie'
                        : 'Fire'
                      : cat === 'INTRUSION'
                      ? isFr
                        ? 'Intrusion'
                        : 'Intrusion'
                      : cat === 'DURESS'
                      ? isFr
                        ? 'Contrainte'
                        : 'Duress'
                      : cat === 'MEDICAL'
                      ? isFr
                        ? 'Médical / Chute'
                        : 'Medical'
                      : isFr
                      ? 'Technique'
                      : 'Tech'}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isFr ? 'Rechercher un scénario...' : 'Search scenarios...'}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-500 w-full sm:w-56"
                />
              </div>
            </div>

            {/* Scenarios Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3 pr-1">
              {filteredScenarios.map((scn) => {
                const Icon = categoryIcons[scn.category] || Shield;
                const isSelected = activeScenarioId === scn.id;
                return (
                  <button
                    key={scn.id}
                    onClick={() => {
                      onSelectScenario(scn);
                      onClose();
                    }}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-red-500 shadow-md ring-1 ring-red-500'
                        : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-red-400" />
                          <span className="font-mono font-bold text-slate-300">{scn.code}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded border border-slate-800 font-mono text-slate-400">
                          {scn.priority}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-100">{scn.title[language]}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {scn.summary[language]}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">{scn.siteInfo.siteName}</span>
                      <span className="font-mono text-amber-400/90 font-semibold">
                        Code: {scn.siteInfo.primaryPasscode}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PERSONAS.map((per) => {
              const isSelected = activePersonaId === per.id;
              return (
                <button
                  key={per.id}
                  onClick={() => {
                    onSelectPersona(per);
                    onClose();
                  }}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-red-500 shadow-md ring-1 ring-red-500'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                        <User className="w-5 h-5 text-slate-300" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">{per.name}</div>
                        <div className="text-[11px] text-slate-400">{per.age} ans · {per.role[language]}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      {per.description[language]}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 italic">
                    {per.traits[language]}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
