/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isSubscriberSpeaking: boolean;
  isOperatorTransmitting: boolean;
  callConnected: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isSubscriberSpeaking,
  isOperatorTransmitting,
  callConnected,
}) => {
  const [bars, setBars] = useState<number[]>(Array(24).fill(6));

  useEffect(() => {
    let animId: number;

    const update = () => {
      if (isSubscriberSpeaking || isOperatorTransmitting) {
        setBars(
          Array(24)
            .fill(0)
            .map(() => {
              const base = isOperatorTransmitting ? 18 : 14;
              return Math.floor(Math.random() * 26) + base;
            })
        );
      } else if (callConnected) {
        // Subtle line noise
        setBars(
          Array(24)
            .fill(0)
            .map(() => Math.floor(Math.random() * 5) + 4)
        );
      } else {
        setBars(Array(24).fill(4));
      }
      animId = requestAnimationFrame(update);
    };

    const interval = setInterval(update, 80);
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
    };
  }, [isSubscriberSpeaking, isOperatorTransmitting, callConnected]);

  return (
    <div className="flex items-center justify-between gap-1.5 h-10 px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800/80">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          {isOperatorTransmitting
            ? 'TX MIC (OPÉRATEUR)'
            : isSubscriberSpeaking
            ? 'RX LIGNE (CLIENT)'
            : callConnected
            ? 'CANAL EN VEILLE'
            : 'HORS LIGNE'}
        </span>
      </div>

      <div className="flex items-end gap-[3px] h-6">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-75 ${
              isOperatorTransmitting
                ? 'bg-amber-400'
                : isSubscriberSpeaking
                ? 'bg-emerald-400'
                : 'bg-slate-700'
            }`}
            style={{ height: `${Math.min(h, 24)}px` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <span className="hidden sm:inline">CODEC G.711 / 64 kbps</span>
        <span
          className={`w-2 h-2 rounded-full ${
            callConnected ? 'bg-emerald-500' : 'bg-slate-600'
          }`}
        />
      </div>
    </div>
  );
};
