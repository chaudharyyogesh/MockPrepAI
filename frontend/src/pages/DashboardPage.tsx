import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInterviewHistory } from '../api/interview';
import { getProfile } from '../api/profile';

const DashboardPage: React.FC = () => {
  const { data: history } = useQuery({
    queryKey: ['interviewHistory'],
    queryFn: getInterviewHistory,
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const last = history?.[0];
  const canStartInterview = !isProfileLoading && !!profile;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        {canStartInterview ? (
          <Link
            to="/interview/setup"
            className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold"
          >
            Start mock interview
          </Link>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-md bg-slate-800 text-slate-400 text-sm font-semibold cursor-not-allowed"
              title="Complete your profile to start."
            >
              Start mock interview
            </button>
            <div className="text-xs text-slate-400">
              Complete your profile to start.
            </div>
          </div>
        )}
      </div>

      {last && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-sm text-slate-400 mb-1">Last interview</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-medium">
                {last.interviewDomain} · {last.experienceLevel}
              </div>
              <div className="text-xs text-slate-400">
                {last.startTime
                  ? new Date(last.startTime).toLocaleString()
                  : 'Unknown date'}
              </div>
            </div>
            {last.evaluation && (
              <div className="text-right">
                <div className="text-sm text-slate-400">Overall score</div>
                <div className="text-2xl font-semibold">
                  {last.evaluation.overallScore}/100
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-lg font-medium mb-2">Quick links</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          {!isProfileLoading && !profile && (
            <Link
              to="/profile"
              className="px-3 py-2 rounded-md border border-slate-700 hover:border-slate-500"
            >
              Edit profile
            </Link>
          )}
          <Link
            to="/interview/history"
            className="px-3 py-2 rounded-md border border-slate-700 hover:border-slate-500"
          >
            View history
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

