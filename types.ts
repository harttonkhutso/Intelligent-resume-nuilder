
export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: number;
  degree: string;
  university: string;
  location: string;
  gradDate: string;
}

export interface Certificate {
  id: number;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  certificates: Certificate[];
  skills: string[];
}

export enum AnalysisType {
  Keywords = 'Keywords',
  ATS = 'ATS',
  Match = 'Match',
  Skills = 'Skills',
  ContentSuggestion = 'ContentSuggestion',
}

export type Template = 'classic' | 'modern' | 'minimalist';

export type Font = 'Arial' | 'Georgia' | 'Verdana' | 'Times New Roman';

export interface KeywordAnalysis {
  type: AnalysisType.Keywords;
  data: string[];
}

export interface SkillAnalysis {
  type: AnalysisType.Skills;
  data: string[];
}

export interface ATSAnalysis {
  type: AnalysisType.ATS;
  data: string;
}

export interface MatchAnalysis {
  type: AnalysisType.Match;
  data: {
    score: number;
    analysis: string;
  };
}

export interface ContentSuggestionAnalysis {
    type: AnalysisType.ContentSuggestion;
    data: {
        experienceId: number;
        suggestions: string[];
    };
}

export type AnalysisResult = KeywordAnalysis | ATSAnalysis | MatchAnalysis | SkillAnalysis | ContentSuggestionAnalysis;

export interface LoadingStates {
  summary: boolean;
  experience: number | null; // ID of the experience item being generated
  keywords: boolean;
  ats: boolean;
  match: boolean;
  skills: boolean;
  parsing: boolean;
  suggestions: number | null; // ID of the experience item for suggestions
  coverLetter: boolean;
}