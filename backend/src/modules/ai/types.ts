export type InterviewSectionKey = 'introduction' | 'technical' | 'behavioral' | 'closing';

export interface GeneratedQuestion {
  section: InterviewSectionKey;
  text: string;
  tags?: string[];
}

