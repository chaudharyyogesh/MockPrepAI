import React, { useMemo, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getProfile, upsertProfile } from '../api/profile';
import { uploadResume } from '../api/resume';

const ProfilePage: React.FC = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const [primaryRole, setPrimaryRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior'>('entry');
  const [domainOpen, setDomainOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);

  const domainSuggestions = useMemo(
    () => [
      'Software Engineer',
      'Data Engineer',
      'Product Manager',
      'Financial Analyst',
      'Marketing Analyst',
    ],
    [],
  );
  const filteredSuggestions = useMemo(() => {
    const q = primaryRole.trim().toLowerCase();
    if (!q) return domainSuggestions;
    return domainSuggestions.filter((d) => d.toLowerCase().includes(q));
  }, [primaryRole, domainSuggestions]);

  useEffect(() => {
    if (profile) {
      setPrimaryRole(profile.primaryRole);
      setExperienceLevel(profile.experienceLevel as 'entry' | 'mid' | 'senior');
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: upsertProfile,
  });

  const resumeMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => setResumeMessage('Resume uploaded.'),
    onError: (err: any) =>
      setResumeMessage((err as Error)?.message || 'Resume upload failed.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ primaryRole, experienceLevel });
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      {isLoading ? (
        <div className="text-sm text-slate-400">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
            <div className="text-sm font-medium mb-2">Resume</div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  setResumeMessage(null);
                  setResumeFile(e.target.files?.[0] || null);
                }}
                className="text-sm text-slate-300 cursor-pointer"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!resumeFile || resumeMutation.isLoading}
                  onClick={() => {
                    if (!resumeFile) return;
                    setResumeMessage(null);
                    resumeMutation.mutate(resumeFile);
                  }}
                  className="px-3 py-2 rounded-md border border-slate-700 hover:border-slate-500 disabled:opacity-60 text-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {resumeMutation.isLoading ? 'Uploading...' : 'Upload resume'}
                </button>
                {profile?.currentResume?.originalFilename && (
                  <div className="text-xs text-slate-400">
                    Current: {profile.currentResume.originalFilename}
                  </div>
                )}
              </div>
              {resumeMessage && (
                <div className="text-xs text-slate-300">{resumeMessage}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Interview domain</label>
            <div className="relative">
              <input
                className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                value={primaryRole}
                onChange={(e) => {
                  setPrimaryRole(e.target.value);
                  setDomainOpen(true);
                }}
                onFocus={() => setDomainOpen(true)}
                onBlur={() => {
                  // allow click selection
                  window.setTimeout(() => setDomainOpen(false), 120);
                }}
                placeholder="e.g. Software Engineer"
                required
              />
              {domainOpen && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-800 bg-slate-950 shadow-lg overflow-hidden">
                  {filteredSuggestions.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setPrimaryRole(d);
                        setDomainOpen(false);
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">
                Choose a suggested domain or type your own.
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Experience level</label>
            <select
              className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={experienceLevel}
              onChange={(e) =>
                setExperienceLevel(e.target.value as 'entry' | 'mid' | 'senior')
              }
            >
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-sm font-semibold"
          >
            {mutation.isLoading ? 'Saving...' : 'Save profile'}
          </button>
          {mutation.isSuccess && (
            <div className="text-xs text-emerald-300">Profile updated.</div>
          )}
        </form>
      )}
    </div>
  );
};

export default ProfilePage;

