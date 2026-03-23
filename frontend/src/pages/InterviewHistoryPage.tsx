import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInterviewHistory } from '../api/interview';

const InterviewHistoryPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['interviewHistory'],
    queryFn: getInterviewHistory,
  });

  if (isLoading) {
    return <div className="text-sm text-slate-400">Loading history...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Interview history</h2>
      <div className="rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/70">
            <tr className="text-left">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Domain</th>
              <th className="px-4 py-2">Level</th>
              <th className="px-4 py-2">Duration</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {data?.map((i: any) => (
              <tr key={i.id} className="border-t border-slate-800">
                <td className="px-4 py-2 text-slate-300">
                  {i.startTime
                    ? new Date(i.startTime).toLocaleString()
                    : '—'}
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {i.interviewDomain}
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {i.experienceLevel}
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {i.durationMinutes} min
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {i.evaluation ? `${i.evaluation.overallScore}/100` : '—'}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    to={`/interview/feedback/${i.id}`}
                    className="text-indigo-300 hover:text-indigo-200"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td
                  className="px-4 py-4 text-slate-400 text-center"
                  colSpan={6}
                >
                  No interviews yet. Start one from your dashboard.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterviewHistoryPage;

