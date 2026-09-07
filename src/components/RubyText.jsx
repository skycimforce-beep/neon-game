import React from 'react';

export const RubyText = ({ text, showRuby = false }) => {
  if (!text || typeof text !== 'string') return text;
  // Normalize double-byte parentheses to single-byte brackets to simplify regex parsing
  const normalizedText = text.replace(/（/g, '[').replace(/）/g, ']');
  // eslint-disable-next-line no-useless-escape
  const parts = normalizedText.split(/([^\[\]]+)\[(.*?)\]/g);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 3 === 0) return <span key={i}>{part}</span>;
        if (i % 3 === 1) {
          return showRuby ? (
            <ruby key={i} className="mx-[2px]">
              {part}
              <rt className="text-[0.65em] text-cyan-300 font-bold -translate-y-1 tracking-widest select-none">{parts[i+1]}</rt>
            </ruby>
          ) : (
            <span key={i}>{part}</span>
          );
        }
        return null;
      })}
    </>
  );
};
