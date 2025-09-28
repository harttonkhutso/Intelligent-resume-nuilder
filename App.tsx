
import React, { useState, useCallback, useEffect } from 'react';
import { ResumeData, AnalysisResult, AnalysisType, LoadingStates, Template, Font } from './types';
import ResumeForm from './components/ResumeForm';
import ResumePreview from './components/ResumePreview';
import AnalysisPanel from './components/AnalysisPanel';
import LandingPage from './components/LandingPage';
import { generateExperiencePoints, optimizeKeywords, checkATSCompliance, matchJobDescription, suggestSkills, parseResume, generateContentSuggestions, generateCoverLetter } from './services/geminiService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';
import { HomeIcon, SparklesIcon, ClipboardDocumentIcon } from './components/icons';

const initialResumeData: ResumeData = {
  personalInfo: { name: 'Your Name', email: 'your.email@example.com', phone: '123-456-7890', linkedin: 'linkedin.com/in/yourprofile', website: 'yourportfolio.com' },
  summary: 'A brief professional summary. Click the ✨ button to generate one with AI based on your experience.',
  experience: [
    { id: 1, title: 'Software Engineer', company: 'Tech Solutions Inc.', location: 'San Francisco, CA', startDate: 'Jan 2022', endDate: 'Present', description: '• Developed and maintained web applications using React and Node.js.\n• Collaborated with cross-functional teams to deliver high-quality software.' },
  ],
  education: [
    { id: 1, degree: 'B.S. in Computer Science', university: 'State University', location: 'Anytown, USA', gradDate: 'May 2021' },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Problem Solving'],
};

const App: React.FC = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const savedData = localStorage.getItem('resumeData');
      return savedData ? JSON.parse(savedData) : initialResumeData;
    } catch (error) {
      console.error("Failed to parse resumeData from localStorage", error);
      return initialResumeData;
    }
  });

  const [jobDescription, setJobDescription] = useState<string>(() => {
    return localStorage.getItem('jobDescription') || '';
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('classic');
  const [selectedFont, setSelectedFont] = useState<Font>('Times New Roman');
  const [primaryColor, setPrimaryColor] = useState<string>('#007BFF');
  const [secondaryColor, setSecondaryColor] = useState<string>('#343a40');
  const [isCoverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [coverLetterContent, setCoverLetterContent] = useState('');

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    summary: false,
    experience: null,
    keywords: false,
    ats: false,
    match: false,
    skills: false,
    parsing: false,
    suggestions: null,
    coverLetter: false,
  });

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    localStorage.setItem('jobDescription', jobDescription);
  }, [jobDescription]);


  const getResumeAsText = useCallback((includeSkills = true) => {
    let text = `Name: ${resumeData.personalInfo.name}\nEmail: ${resumeData.personalInfo.email}\nPhone: ${resumeData.personalInfo.phone}\n\nSummary: ${resumeData.summary}\n\nExperience:\n`;
    resumeData.experience.forEach(exp => {
      text += `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n${exp.description}\n\n`;
    });
    text += `Education:\n`;
    resumeData.education.forEach(edu => {
      text += `${edu.degree}, ${edu.university} (${edu.gradDate})\n`;
    });
    if (includeSkills) {
      text += `\nSkills: ${resumeData.skills.join(', ')}`;
    }
    return text;
  }, [resumeData]);

  const handleGenerateSummary = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, summary: true }));
    setAnalysisResult(null);
    try {
      const resumeText = getResumeAsText();
      const prompt = `Based on the following resume, write a compelling and professional summary of 2-3 sentences:\n\n${resumeText}`;
      const summary = await generateExperiencePoints(prompt);
      setResumeData(prev => ({...prev, summary}));
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please check your API key and try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, summary: false }));
    }
  }, [getResumeAsText]);
  
  const handleGenerateExperience = useCallback(async (expId: number) => {
    setLoadingStates(prev => ({ ...prev, experience: expId }));
    setAnalysisResult(null);
    const experienceItem = resumeData.experience.find(e => e.id === expId);
    if (!experienceItem) return;

    try {
        const prompt = `Generate 3-5 concise, action-oriented bullet points for a resume, for the role of '${experienceItem.title}' at '${experienceItem.company}'. Focus on achievements and quantifiable results.`;
        const points = await generateExperiencePoints(prompt);
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === expId ? { ...exp, description: points } : exp),
        }));
    } catch (error) {
        console.error('Error generating experience:', error);
        alert('Failed to generate experience points. Please check your API key and try again.');
    } finally {
        setLoadingStates(prev => ({ ...prev, experience: null }));
    }
  }, [resumeData.experience]);

  const handleContentSuggestions = useCallback(async (expId: number) => {
    setLoadingStates(prev => ({...prev, suggestions: expId}));
    setAnalysisResult(null);
    const experienceItem = resumeData.experience.find(e => e.id === expId);
    if (!experienceItem || !experienceItem.title) {
        alert("Please enter a job title first.");
        setLoadingStates(prev => ({...prev, suggestions: null}));
        return;
    }

    try {
        const suggestions = await generateContentSuggestions(experienceItem.title);
        setAnalysisResult({
            type: AnalysisType.ContentSuggestion,
            data: {
                experienceId: expId,
                suggestions: suggestions
            }
        });
    } catch (error) {
        console.error('Error getting content suggestions:', error);
        alert('Failed to get content suggestions.');
    } finally {
        setLoadingStates(prev => ({...prev, suggestions: null}));
    }
  }, [resumeData.experience]);

  const handleAnalyzeKeywords = useCallback(async () => {
    if (!jobDescription) {
      alert('Please paste a job description first.');
      return;
    }
    setLoadingStates(prev => ({ ...prev, keywords: true }));
    try {
      const keywords = await optimizeKeywords(getResumeAsText(), jobDescription);
      setAnalysisResult({ type: AnalysisType.Keywords, data: keywords });
    } catch (error) {
      console.error('Error analyzing keywords:', error);
      alert('Failed to analyze keywords.');
    } finally {
      setLoadingStates(prev => ({ ...prev, keywords: false }));
    }
  }, [jobDescription, getResumeAsText]);

  const handleSuggestSkills = useCallback(async () => {
    if (!jobDescription) {
      alert('Please paste a job description first.');
      return;
    }
    setLoadingStates(prev => ({ ...prev, skills: true }));
    try {
        const experienceText = resumeData.experience.map(e => `${e.title}\n${e.description}`).join('\n\n');
        const suggestedSkills = await suggestSkills(experienceText, jobDescription, resumeData.skills);
        setAnalysisResult({ type: AnalysisType.Skills, data: suggestedSkills });
    } catch (error) {
        console.error('Error suggesting skills:', error);
        alert('Failed to suggest skills.');
    } finally {
        setLoadingStates(prev => ({ ...prev, skills: false }));
    }
}, [jobDescription, resumeData.experience, resumeData.skills]);

  const handleCheckATS = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, ats: true }));
    try {
      const feedback = await checkATSCompliance(getResumeAsText());
      setAnalysisResult({ type: AnalysisType.ATS, data: feedback });
    } catch (error) {
      console.error('Error checking ATS compliance:', error);
      alert('Failed to check ATS compliance.');
    } finally {
      setLoadingStates(prev => ({ ...prev, ats: false }));
    }
  }, [getResumeAsText]);

  const handleMatchJob = useCallback(async () => {
    if (!jobDescription) {
      alert('Please paste a job description first.');
      return;
    }
    setLoadingStates(prev => ({ ...prev, match: true }));
    try {
      const matchData = await matchJobDescription(getResumeAsText(), jobDescription);
      setAnalysisResult({ type: AnalysisType.Match, data: matchData });
    } catch (error) {
      console.error('Error matching job description:', error);
      alert('Failed to match job description.');
    } finally {
      setLoadingStates(prev => ({ ...prev, match: false }));
    }
  }, [jobDescription, getResumeAsText]);
  
  const handleGenerateCoverLetter = useCallback(async () => {
    if (!jobDescription) {
      alert('Please paste a job description first to generate a cover letter.');
      return;
    }
    setLoadingStates(prev => ({ ...prev, coverLetter: true }));
    setCoverLetterModalOpen(true);
    setCoverLetterContent('');
    try {
      const letter = await generateCoverLetter(getResumeAsText(), jobDescription);
      setCoverLetterContent(letter);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setCoverLetterContent('Sorry, there was an error generating your cover letter. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, coverLetter: false }));
    }
  }, [jobDescription, getResumeAsText]);

  const handleResumeUpload = async (file: File) => {
    if (!file) return;

    setLoadingStates(prev => ({ ...prev, parsing: true }));
    try {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            if (typeof event.target?.result !== 'string') {
              throw new Error("Failed to read file.");
            }
            const base64Data = event.target.result.split(',')[1];
            const parsedData = await parseResume({ mimeType: file.type, data: base64Data });
            
            setResumeData(prev => ({
              personalInfo: { ...prev.personalInfo, ...parsedData.personalInfo },
              summary: parsedData.summary || prev.summary,
              experience: parsedData.experience && parsedData.experience.length > 0 ? parsedData.experience : prev.experience,
              education: parsedData.education && parsedData.education.length > 0 ? parsedData.education : prev.education,
              skills: parsedData.skills && parsedData.skills.length > 0 ? parsedData.skills : prev.skills,
            }));
            setShowBuilder(true);
            resolve();
          } catch (e) {
            reject(e);
          }
        };
        reader.onerror = () => {
          reject(new Error("Error reading the resume file."));
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error parsing resume:', error);
      alert((error as Error).message || 'Failed to parse resume. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, parsing: false }));
    }
  };


  const handlePdfExport = () => {
    const resumeElement = document.getElementById('resume-preview-content');
    if (resumeElement) {
      html2canvas(resumeElement, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${resumeData.personalInfo.name.replace(' ', '_')}_Resume.pdf`);
      });
    }
  };

  const handleHtmlExport = () => {
    const resumeElement = document.getElementById('resume-preview-content');
    if (resumeElement) {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${resumeData.personalInfo.name}'s Resume</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                  body {
                    font-family: ${selectedFont}, sans-serif;
                    --primary-color: ${primaryColor};
                    --secondary-color: ${secondaryColor};
                  }
                </style>
            </head>
            <body class="p-8">
                ${resumeElement.innerHTML}
            </body>
            </html>
        `;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${resumeData.personalInfo.name.replace(' ', '_')}_Resume.html`;
        link.click();
    }
  };

  const handleDocxExport = () => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: resumeData.personalInfo.name, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun(resumeData.personalInfo.email),
              new TextRun(' | '),
              new TextRun(resumeData.personalInfo.phone),
              new TextRun(' | '),
              new TextRun(resumeData.personalInfo.linkedin),
            ]
          }),
          new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } } }),
          new Paragraph(resumeData.summary),
          new Paragraph({ text: "Work Experience", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } } }),
          ...resumeData.experience.flatMap(exp => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.title, bold: true }),
                new TextRun({ text: ` | ${exp.company}`, italics: true }),
              ],
            }),
            new Paragraph({
                children: [new TextRun({text: `${exp.startDate} - ${exp.endDate}`, color: "555555"})],
                alignment: AlignmentType.RIGHT,
                frame: {
                    position: {
                        x: convertInchesToTwip(6),
                        y: 0
                    },
                    width: convertInchesToTwip(2.5),
                    height: convertInchesToTwip(0.2)
                }
            }),
            ...exp.description.split('\n').filter(line => line.trim()).map(line => new Paragraph({ text: line, bullet: { level: 0 } })),
            new Paragraph(""),
          ]),
          new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } } }),
          ...resumeData.education.map(edu => new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true }),
              new TextRun(` at ${edu.university} (${edu.gradDate})`),
            ]
          })),
          new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2, border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } } }),
          new Paragraph(resumeData.skills.join(', ')),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.name.replace(' ', '_')}_Resume.docx`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const aiActions = { handleGenerateSummary, handleGenerateExperience, handleContentSuggestions, handleGenerateCoverLetter };
  const analysisActions = { handleAnalyzeKeywords, handleCheckATS, handleMatchJob, handleSuggestSkills };
  const exportActions = { handlePdfExport, handleHtmlExport, handleDocxExport };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetterContent).then(() => {
        alert('Cover letter copied to clipboard!');
    }, (err) => {
        console.error('Could not copy text: ', err);
        alert('Failed to copy cover letter.');
    });
  };

  if (loadingStates.parsing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
        <div className="animate-spin-slow text-white">
          <SparklesIcon className="w-16 h-16" />
        </div>
        <p className="mt-4 text-xl font-semibold text-white">AI is parsing your resume...</p>
      </div>
    );
  }

  if (!showBuilder) {
    return <LandingPage onStartBuilding={() => setShowBuilder(true)} onUploadResume={handleResumeUpload} />;
  }

  return (
    <>
      {isCoverLetterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setCoverLetterModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">AI Generated Cover Letter</h3>
              <button onClick={() => setCoverLetterModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-5 overflow-y-auto flex-grow">
              {loadingStates.coverLetter ? (
                <div className="flex items-center justify-center h-full">
                  <SparklesIcon className="w-10 h-10 text-primary animate-pulse" />
                  <p className="ml-4 text-gray-600">Generating your cover letter...</p>
                </div>
              ) : (
                <textarea 
                  value={coverLetterContent}
                  onChange={(e) => setCoverLetterContent(e.target.value)}
                  className="w-full h-full min-h-[400px] p-3 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                  aria-label="Generated Cover Letter"
                />
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-lg">
              <button onClick={copyToClipboard} disabled={loadingStates.coverLetter} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-blue-300 transition-colors">
                  <ClipboardDocumentIcon/> Copy Text
              </button>
              <button onClick={() => setCoverLetterModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen font-sans text-gray-800 bg-slate-50">
        <header className="bg-white shadow-md sticky top-0 z-20">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Intelligent Resume Generator</h1>
            <button
              onClick={() => setShowBuilder(false)}
              className="flex items-center justify-center gap-2 bg-secondary hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              aria-label="Back to Home"
            >
              <HomeIcon />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </header>
        <main className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResumeForm 
            resumeData={resumeData}
            setResumeData={setResumeData}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            loadingStates={loadingStates}
            aiActions={aiActions}
            analysisActions={analysisActions}
            exportActions={exportActions}
          />
          <div className="space-y-8 sticky top-24 self-start">
            <AnalysisPanel 
              analysisResult={analysisResult} 
              loadingStates={loadingStates} 
              setResumeData={setResumeData}
              resumeData={resumeData}
            />
            <ResumePreview 
              resumeData={resumeData} 
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              secondaryColor={secondaryColor}
              setSecondaryColor={setSecondaryColor}
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default App;
