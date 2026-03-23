import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { answerQuestion, endInterview, getCurrentQuestion } from '../api/interview';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface LocationState {
  firstQuestion?: {
    id: string;
    text: string;
    section: string;
    orderIndex: number;
  };
  duration?: number;
}

const InterviewRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { firstQuestion, duration } = (location.state as LocationState) || {};

  const [question, setQuestion] = useState(firstQuestion || null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Simple countdown timer in seconds
  const [secondsLeft, setSecondsLeft] = useState(
    duration ? duration * 60 : 15 * 60,
  );

  const speech = useSpeechToText();
  const recorder = useAudioRecorder();

  useEffect(() => {
    if (!id) return;
    if (!firstQuestion) {
      getCurrentQuestion(id).then((res) => {
        if (res.done) {
          setDone(true);
        } else if (res.question) {
          setQuestion(res.question);
        }
      });
    }
  }, [id, firstQuestion]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmitAnswer = async () => {
    if (!id || !question) return;
    const finalTranscript = speech.transcript.trim();
    if (!finalTranscript) return;
    setSubmitting(true);
    try {
      const res = await answerQuestion(id, question.id, {
        transcript: finalTranscript,
        durationSeconds: 60,
        audioUrl: recorder.audioUrl || undefined,
      });
      speech.setTranscript('');
      if (res.done) {
        setDone(true);
      } else if (res.question) {
        setQuestion(res.question);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (!id) return;
    await endInterview(id);
    navigate(`/interview/feedback/${id}`);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Interview room</h2>
        <div className="text-sm text-slate-300">
          Time left:{' '}
          <span className="font-mono">
            {minutes.toString().padStart(2, '0')}:
            {seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {done ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-3 text-sm text-slate-300">
            You&apos;ve answered all questions.
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 text-sm font-semibold"
          >
            View feedback
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              AI question
            </div>
            <div className="text-lg font-medium">{question?.text}</div>
            <div className="text-xs text-slate-400">
              Section: {question?.section} · Question {question?.orderIndex + 1}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-300">Your answer</div>
              <div className="text-xs text-slate-500">
                {speech.supported
                  ? 'Use your microphone to answer; we transcribe in real time.'
                  : 'Browser speech recognition not available; type your answer.'}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={
                  speech.listening ? speech.stop : speech.start
                }
                className="px-3 py-1.5 rounded-md border border-slate-700 hover:border-slate-500"
              >
                {speech.listening ? 'Stop listening' : 'Start listening'}
              </button>
              <button
                type="button"
                onClick={
                  recorder.recording
                    ? recorder.stopRecording
                    : recorder.startRecording
                }
                className="px-3 py-1.5 rounded-md border border-slate-700 hover:border-slate-500"
              >
                {recorder.recording ? 'Stop recording' : 'Record audio'}
              </button>
              {recorder.audioUrl && (
                <audio
                  controls
                  src={recorder.audioUrl}
                  className="ml-2 h-8"
                />
              )}
            </div>

            <textarea
              className="w-full rounded-md bg-slate-950 border border-slate-700 px-3 py-2 text-sm min-h-[140px]"
              placeholder="Your transcribed answer will appear here. You can edit it before submitting."
              value={speech.transcript}
              onChange={(e) => speech.setTranscript(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={submitting || !speech.transcript.trim()}
                onClick={handleSubmitAnswer}
                className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-sm font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit answer'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewRoomPage;

