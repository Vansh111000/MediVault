import React from 'react';

/**
 * Splits medical notes, summaries, or paragraphs into concise, readable bullet points.
 */
export const parseSummaryToPoints = (text) => {
  if (!text || typeof text !== 'string') return [];

  const rawSegments = text
    .split(/\r?\n|•|– |— /)
    .flatMap(segment => {
      // Split by period/exclamation/question mark followed by whitespace and capital letter
      // Won't break numbers like 0.92 mg/dL or eGFR >90 mL/min/1.73m2
      return segment.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
    })
    .map(p => p.trim())
    .map(p => p.replace(/^[•\-\*–—\d+\.]\s*/, '').trim())
    .filter(p => p.length > 0)
    .map(p => (p.endsWith('.') || p.endsWith(':') || p.endsWith('!') ? p : `${p}.`));

  return rawSegments;
};

export const SummaryPointsList = ({ text, className = '' }) => {
  const points = parseSummaryToPoints(text);

  if (!points || points.length === 0) return null;

  return (
    <ul className={`space-y-1.5 my-2 ${className}`}>
      {points.map((point, idx) => (
        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-700 mt-1.5 shrink-0" />
          <span className="flex-1">{point}</span>
        </li>
      ))}
    </ul>
  );
};
