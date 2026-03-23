import { apiRequest } from './client';

export interface InterviewQuestion {
  id: string;
  section: string;
  orderIndex: number;
  text: string;
}

export interface StartInterviewResponse {
  interviewId: string;
  question: InterviewQuestion;
}

export async function startInterview(payload: {
  interviewDomain:
    | 'software_engineer'
    | 'data_engineer'
    | 'product_manager'
    | 'financial_analyst'
    | 'marketing_analyst';
  experienceLevel: 'entry' | 'mid' | 'senior';
  durationMinutes: number;
}) {
  return apiRequest<StartInterviewResponse>('/interview/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCurrentQuestion(interviewId: string) {
  return apiRequest<{ done: boolean; question?: InterviewQuestion }>(
    `/interview/question?interviewId=${encodeURIComponent(interviewId)}`,
  );
}

export async function answerQuestion(
  interviewId: string,
  questionId: string,
  payload: { transcript: string; audioUrl?: string; durationSeconds: number },
) {
  return apiRequest<{ done: boolean; question?: InterviewQuestion }>(
    `/interview/answer?interviewId=${encodeURIComponent(
      interviewId,
    )}&questionId=${encodeURIComponent(questionId)}`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function endInterview(interviewId: string) {
  return apiRequest<{ status: string }>('/interview/end', {
    method: 'POST',
    body: JSON.stringify({ interviewId }),
  });
}

export async function getInterviewReport(id: string) {
  return apiRequest<any>(`/interview/report/${encodeURIComponent(id)}`);
}

export async function getInterviewHistory() {
  return apiRequest<any[]>('/interview/history');
}

