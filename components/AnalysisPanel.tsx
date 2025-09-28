
import React from 'react';
import { AnalysisResult, AnalysisType, LoadingStates, ResumeData } from '../types';
import { SparklesIcon, PlusIcon } from './icons';

interface AnalysisPanelProps {
  analysisResult: AnalysisResult | null;
  loadingStates: LoadingStates;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  resumeData: ResumeData;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg h-full">
        <SparklesIcon className="w-12 h-12 text-blue-400 animate-pulse" />
        <p className="mt-4 text-lg font-semibold text-gray-600">AI is analyzing...</p>
        <p className="text-sm text-gray-500">This might take a moment.</p>
    </div>
);

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  
  let colorClass = 'text-green-500';
  if (score < 75) colorClass = 'text-yellow-500';
  if (score < 50) colorClass = 'text-red-500';

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
        <circle
          className={colorClass}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-3xl font-bold ${colorClass}`}>{score}%</div>
    </div>
  );
};


const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysisResult, loadingStates, setResumeData, resumeData }) => {
  const isLoading = loadingStates.keywords || loadingStates.ats || loadingStates.match || loadingStates.skills || loadingStates.suggestions !== null;
  
  const addSkill = (skill: string) => {
    setResumeData(prev => {
        if (prev.skills.includes(skill)) {
            return prev;
        }
        return {...prev, skills: [...prev.skills, skill]};
    });
  };

  const handleUseSuggestion = (suggestion: string, experienceId: number) => {
    setResumeData(prev => ({
        ...prev,
        experience: prev.experience.map(exp => {
            if (exp.id === experienceId) {
                const newDescription = exp.description.trim() ? `${exp.description}\n• ${suggestion}` : `• ${suggestion}`;
                return { ...exp, description: newDescription };
            }
            return exp;
        }),
    }));
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg text-center h-full">
        <SparklesIcon className="w-12 h-12 text-gray-400" />
        <p className="mt-4 text-lg font-semibold text-gray-600">AI Analysis Panel</p>
        <p className="text-sm text-gray-500">Your analysis results will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Analysis Results</h3>
      {analysisResult.type === AnalysisType.Keywords && (
        <div>
          <h4 className="text-lg font-bold text-blue-600 mb-2">Keyword Suggestions</h4>
          <p className="text-sm text-gray-600 mb-3">Add these keywords from the job description to improve your match.</p>
          <div className="flex flex-wrap gap-2">
            {(analysisResult.data as string[]).map((keyword, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{keyword}</span>
            ))}
          </div>
        </div>
      )}
      {analysisResult.type === AnalysisType.Skills && (
        <div>
          <h4 className="text-lg font-bold text-yellow-600 mb-2">Skill Suggestions</h4>
          <p className="text-sm text-gray-600 mb-3">Consider adding these relevant skills to your resume.</p>
          <div className="flex flex-wrap gap-2">
            {(analysisResult.data as string[]).map((skill, i) => (
              <button key={i} onClick={() => addSkill(skill)} className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm font-medium pl-3 pr-2 py-1 rounded-full hover:bg-yellow-200 transition-colors">
                {skill}
                <PlusIcon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}
      {analysisResult.type === AnalysisType.ContentSuggestion && (() => {
          const { experienceId, suggestions } = analysisResult.data;
          const experience = resumeData.experience.find(exp => exp.id === experienceId);
          return (
              <div>
                  <h4 className="text-lg font-bold text-green-600 mb-2">Content Suggestions for "{experience?.title || '...'}"</h4>
                  <p className="text-sm text-gray-600 mb-3">Use these ideas to enhance your experience description.</p>
                  <ul className="space-y-2">
                      {suggestions.map((suggestion, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                             <button onClick={() => handleUseSuggestion(suggestion, experienceId)} className="flex-shrink-0 mt-0.5 bg-green-100 text-green-800 rounded-full p-1 hover:bg-green-200 transition-colors" title="Add this suggestion">
                                <PlusIcon className="w-3 h-3"/>
                             </button>
                             <span>{suggestion}</span>
                          </li>
                      ))}
                  </ul>
              </div>
          );
      })()}
      {analysisResult.type === AnalysisType.ATS && (
        <div>
          <h4 className="text-lg font-bold text-green-600 mb-2">ATS Compliance Report</h4>
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: (analysisResult.data as string).replace(/\n/g, '<br />') }} />
        </div>
      )}
      {analysisResult.type === AnalysisType.Match && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-purple-600">Job Match Analysis</h4>
          <div className="flex flex-col items-center gap-4">
             <ScoreCircle score={analysisResult.data.score} />
            <p className="text-lg font-semibold">Your resume has a {analysisResult.data.score}% match with the job description.</p>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 mt-4" dangerouslySetInnerHTML={{ __html: (analysisResult.data.analysis as string).replace(/\n/g, '<br />') }} />
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
