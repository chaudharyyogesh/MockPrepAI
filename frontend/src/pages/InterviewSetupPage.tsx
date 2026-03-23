import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview } from '../api/interview';

const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [domain, setDomain] = useState<
    | 'software_engineer'
    | 'data_engineer'
    | 'product_manager'
    | 'financial_analyst'
    | 'marketing_analyst'
  >('software_engineer');
  const [experience, setExperience] = useState<'entry' | 'mid' | 'senior'>('entry');
  const [duration, setDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimateQuestions = () => {
    if (duration <= 5) return 4;
    if (duration <= 15) return 10;
    return 18;
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await startInterview({
        interviewDomain: domain,
        experienceLevel: experience,
        durationMinutes: duration,
      });
      navigate(`/interview/room/${res.interviewId}`, {
        state: { firstQuestion: res.question, duration },
      });
    } catch (err) {
      setError((err as Error).message || 'Could not start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-semibold mb-4">Configure your interview</h2>
      <form onSubmit={handleStart} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Domain</label>
          <select
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            value={domain}
            onChange={(e) =>
              setDomain(
                e.target.value as
                  | 'software_engineer'
                  | 'data_engineer'
                  | 'product_manager'
                  | 'financial_analyst'
                  | 'marketing_analyst',
              )
            }
          >
            <option value="software_engineer">Software Engineer</option>
            <option value="data_engineer">Data Engineer</option>
            <option value="product_manager">Product Manager</option>
            <option value="financial_analyst">Financial Analyst</option>
            <option value="marketing_analyst">Marketing Analyst</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Experience level</label>
          <select
            className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
            value={experience}
            onChange={(e) =>
              setExperience(e.target.value as 'entry' | 'mid' | 'senior')
            }
          >
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">
            Duration (minutes) — {estimateQuestions()} questions
          </label>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-400 mt-1">
            {duration} minutes, approximately {estimateQuestions()} questions
            across introduction, technical, behavioral, and closing sections.
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-sm font-semibold"
        >
          {loading ? 'Starting...' : 'Start interview'}
        </button>
      </form>
    </div>
  );
};

export default InterviewSetupPage;

