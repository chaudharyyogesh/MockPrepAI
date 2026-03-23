import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getInterviewReport } from '../api/interview';

const InterviewFeedbackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['interviewReport', id],
    queryFn: () => getInterviewReport(id as string),
    enabled: Boolean(id),
  });

  if (isLoading || !data) {
    return <div className="text-sm text-slate-400">Loading report...</div>;
  }

  const evaln = data.evaluation;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Interview feedback</h2>
        <Link
          to="/interview/history"
          className="text-sm text-slate-300 hover:text-indigo-300"
        >
          Back to history
        </Link>
      </div>

      {evaln ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-sm text-slate-400 mb-2">Overall score</div>
          <div className="text-3xl font-semibold mb-1">
            {evaln.overallScore}/100
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
          Scoring has not been generated yet. This will be populated once the
          scoring engine is integrated.
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-lg font-medium mb-2">Transcript</h3>
        <div className="space-y-2 text-sm text-slate-200 max-h-80 overflow-y-auto">
          {data.questions.map((q: any) => {
            const responses = data.responses.filter(
              (r: any) => r.questionId === q.id,
            );
            return (
              <div key={q.id}>
                <div className="font-semibold">Q: {q.text}</div>
                {responses.map((r: any) => (
                  <div key={r.id} className="ml-3 text-slate-300">
                    A: {r.transcript}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default InterviewFeedbackPage;

