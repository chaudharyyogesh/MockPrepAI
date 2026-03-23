import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center">
      <section>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Audio-based mock interviews powered by AI.
        </h1>
        <p className="text-slate-300 mb-6">
          Practice realistic interviews with an AI interviewer that asks
          follow-ups, tracks your performance, and gives detailed scoring
          breakdowns.
        </p>
        <div className="flex gap-4">
          <Link
            to="/signup"
            className="px-6 py-3 rounded-md bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-md border border-slate-700 text-sm font-semibold hover:border-slate-500"
          >
            I already have an account
          </Link>
        </div>
      </section>
      <section className="hidden md:block">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Live mock interview
          </div>
          <div className="h-24 rounded-lg bg-slate-800/80 mb-4 flex items-center justify-center text-slate-400 text-sm">
            Interview waveform / transcript preview
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Domain-specific questions (tech, product, finance, marketing)</li>
            <li>• Real-time transcript and pacing</li>
            <li>• Structured scoring with strengths and weaknesses</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

