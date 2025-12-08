import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface ReplyDisplayProps {
  replyText: string;
}

export const ReplyDisplay: React.FC<ReplyDisplayProps> = ({ replyText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-xl relative border border-slate-200 dark:border-slate-700">
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg transition-colors"
        aria-label="Copy to clipboard"
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{replyText}</p>
    </div>
  );
};