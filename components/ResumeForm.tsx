
import React, { useState, useRef, useEffect } from 'react';
import { ResumeData, LoadingStates, Experience, Education, Certificate } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, DownloadIcon, DocumentTextIcon, CodeBracketIcon, LightBulbIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, ChevronDownIcon } from './icons';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  jobDescription: string;
  setJobDescription: React.Dispatch<React.SetStateAction<string>>;
  loadingStates: LoadingStates;
  aiActions: {
    handleGenerateSummary: () => void;
    handleGenerateExperience: (id: number) => void;
    handleContentSuggestions: (id: number) => void;
    handleGenerateCoverLetter: () => void;
  };
  analysisActions: {
    handleAnalyzeKeywords: () => void;
    handleCheckATS: () => void;
    handleMatchJob: () => void;
    handleSuggestSkills: () => void;
  };
  exportActions: {
    handlePdfExport: () => void;
    handleHtmlExport: () => void;
    handleDocxExport: () => void;
  };
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">{title}</h3>
    {children}
  </div>
);

const AccordionSection = React.forwardRef<HTMLDivElement, { title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }>
(({ title, children, isOpen, onToggle }, ref) => {
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden" ref={ref}>
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={isOpen}
            >
                <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                ref={contentRef}
                className="transition-all duration-500 ease-in-out"
                style={{
                    maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0px',
                    overflow: 'hidden'
                }}
            >
                <div className="px-6 pb-6 pt-0">
                    {children}
                </div>
            </div>
        </div>
    );
});

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
    />
  </div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
    />
  </div>
);

const ResumeForm: React.FC<ResumeFormProps> = ({
  resumeData, setResumeData, jobDescription, setJobDescription, loadingStates,
  aiActions, analysisActions, exportActions
}) => {
  const [currentSkill, setCurrentSkill] = useState('');
  const [openSections, setOpenSections] = useState<string[]>(['Personal Information']);
  const [scrollToSection, setScrollToSection] = useState<string | null>(null);

  const experienceSectionRef = useRef<HTMLDivElement>(null);
  const educationSectionRef = useRef<HTMLDivElement>(null);
  const certificatesSectionRef = useRef<HTMLDivElement>(null);
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => 
        prev.includes(section)
            ? prev.filter(s => s !== section)
            : [...prev, section]
    );
  };
  
  useEffect(() => {
    const refs: { [key: string]: React.RefObject<HTMLDivElement> } = {
        'Work Experience': experienceSectionRef,
        'Education': educationSectionRef,
        'Certificates': certificatesSectionRef,
    };

    if (scrollToSection && refs[scrollToSection]?.current) {
        setTimeout(() => {
            refs[scrollToSection].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setScrollToSection(null);
        }, 500); // Wait for accordion animation to complete
    }
  }, [openSections, scrollToSection]);


  const handleChange = <T,>(section: keyof ResumeData, field: keyof T, value: string, id?: number) => {
    setResumeData(prev => {
      if (Array.isArray(prev[section])) {
        const arraySection = prev[section] as any[];
        return {
          ...prev,
          [section]: arraySection.map(item => (item.id === id ? { ...item, [field]: value } : item)),
        };
      } else {
        return {
          ...prev,
          [section]: { ...(prev[section] as object), [field]: value },
        };
      }
    });
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && currentSkill) {
      e.preventDefault();
      const newSkill = currentSkill.trim();
      if (newSkill && !resumeData.skills.map(s => s.toLowerCase()).includes(newSkill.toLowerCase())) {
        setResumeData(prev => ({
          ...prev,
          skills: [...prev.skills, newSkill],
        }));
        setCurrentSkill('');
      } else {
        setCurrentSkill('');
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  const addExperience = () => {
    const newExp: Experience = { id: Date.now(), title: '', company: '', location: '', startDate: '', endDate: '', description: '' };
    setResumeData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    if (!openSections.includes('Work Experience')) {
        setOpenSections(prev => [...prev, 'Work Experience']);
        setScrollToSection('Work Experience');
    }
  };
  
  const removeExperience = (id: number) => {
    setResumeData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };
  
  const addEducation = () => {
    const newEdu: Education = { id: Date.now(), degree: '', university: '', location: '', gradDate: '' };
    setResumeData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    if (!openSections.includes('Education')) {
        setOpenSections(prev => [...prev, 'Education']);
        setScrollToSection('Education');
    }
  };

  const removeEducation = (id: number) => {
    setResumeData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const addCertificate = () => {
    const newCert: Certificate = { id: Date.now(), name: '', issuer: '', date: '' };
    setResumeData(prev => ({ ...prev, certificates: [...(prev.certificates || []), newCert] }));
    if (!openSections.includes('Certificates')) {
        setOpenSections(prev => [...prev, 'Certificates']);
        setScrollToSection('Certificates');
    }
  };

  const removeCertificate = (id: number) => {
    setResumeData(prev => ({ ...prev, certificates: prev.certificates.filter(cert => cert.id !== id) }));
  };

  const renderLoadingSpinner = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>;

  return (
    <div className="space-y-6">
        <Section title="AI Analysis & Export">
          <div className="space-y-4">
            <TextArea 
              label="Target Job Description" 
              rows={6}
              placeholder="Paste the job description here to enable analysis features..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              <button onClick={analysisActions.handleAnalyzeKeywords} disabled={loadingStates.keywords || !jobDescription} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-blue-300 transition-colors">
                {loadingStates.keywords ? renderLoadingSpinner() : <SparklesIcon />} Keywords
              </button>
              <button onClick={analysisActions.handleSuggestSkills} disabled={loadingStates.skills || !jobDescription} className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-yellow-300 transition-colors">
                {loadingStates.skills ? renderLoadingSpinner() : <LightBulbIcon />} Suggest Skills
              </button>
              <button onClick={analysisActions.handleCheckATS} disabled={loadingStates.ats} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-green-300 transition-colors">
                 {loadingStates.ats ? renderLoadingSpinner() : <SparklesIcon />} ATS Check
              </button>
              <button onClick={analysisActions.handleMatchJob} disabled={loadingStates.match || !jobDescription} className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-purple-300 transition-colors">
                {loadingStates.match ? renderLoadingSpinner() : <SparklesIcon />} Match Score
              </button>
            </div>
            <div className="pt-4 border-t space-y-3">
                <button onClick={aiActions.handleGenerateCoverLetter} disabled={loadingStates.coverLetter || !jobDescription} className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-teal-300 transition-colors">
                    {loadingStates.coverLetter ? renderLoadingSpinner() : <EnvelopeIcon />} Generate Cover Letter
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                   <button onClick={exportActions.handlePdfExport} className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <DownloadIcon /> PDF
                  </button>
                   <button onClick={exportActions.handleDocxExport} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <DocumentTextIcon /> DOCX
                  </button>
                  <button onClick={exportActions.handleHtmlExport} className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <CodeBracketIcon /> HTML
                  </button>
                </div>
            </div>
          </div>
        </Section>
        
        <AccordionSection title="Personal Information" isOpen={openSections.includes('Personal Information')} onToggle={() => toggleSection('Personal Information')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={resumeData.personalInfo.name} onChange={e => handleChange('personalInfo', 'name', e.target.value)} />
                <Input label="Email" type="email" value={resumeData.personalInfo.email} onChange={e => handleChange('personalInfo', 'email', e.target.value)} />
                <Input label="Phone" value={resumeData.personalInfo.phone} onChange={e => handleChange('personalInfo', 'phone', e.target.value)} />
                <Input label="LinkedIn" value={resumeData.personalInfo.linkedin} onChange={e => handleChange('personalInfo', 'linkedin', e.target.value)} />
                <Input label="Website/Portfolio" value={resumeData.personalInfo.website} onChange={e => handleChange('personalInfo', 'website', e.target.value)} />
            </div>
        </AccordionSection>
        
        <AccordionSection title="Professional Summary" isOpen={openSections.includes('Professional Summary')} onToggle={() => toggleSection('Professional Summary')}>
            <div className="relative">
                <TextArea label="Summary" rows={4} value={resumeData.summary} onChange={e => setResumeData(prev => ({...prev, summary: e.target.value}))} />
                <button onClick={aiActions.handleGenerateSummary} disabled={loadingStates.summary} className="absolute top-0 right-0 mt-2 mr-2 bg-primary hover:bg-primary-dark text-white p-2 rounded-full disabled:bg-blue-300 transition-colors" title="Generate with AI">
                    {loadingStates.summary ? renderLoadingSpinner() : <SparklesIcon />}
                </button>
            </div>
        </AccordionSection>
        
        <AccordionSection ref={experienceSectionRef} title="Work Experience" isOpen={openSections.includes('Work Experience')} onToggle={() => toggleSection('Work Experience')}>
            {resumeData.experience.map((exp) => (
                <div key={exp.id} className="p-4 border rounded-md mb-4 space-y-4 bg-slate-50 relative">
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" title="Remove Experience"><TrashIcon /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Job Title" value={exp.title} onChange={e => handleChange('experience', 'title', e.target.value, exp.id)} />
                        <Input label="Company" value={exp.company} onChange={e => handleChange('experience', 'company', e.target.value, exp.id)} />
                        <Input label="Location" value={exp.location} onChange={e => handleChange('experience', 'location', e.target.value, exp.id)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Start Date" value={exp.startDate} onChange={e => handleChange('experience', 'startDate', e.target.value, exp.id)} />
                        <Input label="End Date" value={exp.endDate} onChange={e => handleChange('experience', 'endDate', e.target.value, exp.id)} />
                    </div>
                    <div className="relative">
                        <TextArea label="Description" rows={5} value={exp.description} onChange={e => handleChange('experience', 'description', e.target.value, exp.id)} />
                        <div className="absolute top-0 right-0 mt-2 mr-2 flex flex-col gap-2">
                            <button onClick={() => aiActions.handleContentSuggestions(exp.id)} disabled={loadingStates.suggestions === exp.id} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full disabled:bg-green-300 transition-colors" title="Get Smart Suggestions">
                               {loadingStates.suggestions === exp.id ? renderLoadingSpinner() : <ChatBubbleLeftRightIcon />}
                            </button>
                            <button onClick={() => aiActions.handleGenerateExperience(exp.id)} disabled={loadingStates.experience === exp.id} className="bg-primary hover:bg-primary-dark text-white p-2 rounded-full disabled:bg-blue-300 transition-colors" title="Generate Description with AI">
                               {loadingStates.experience === exp.id ? renderLoadingSpinner() : <SparklesIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addExperience} className="flex items-center gap-2 mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"><PlusIcon /> Add Experience</button>
        </AccordionSection>

        <AccordionSection ref={educationSectionRef} title="Education" isOpen={openSections.includes('Education')} onToggle={() => toggleSection('Education')}>
            {resumeData.education.map(edu => (
                <div key={edu.id} className="p-4 border rounded-md mb-4 space-y-4 bg-slate-50 relative">
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" title="Remove Education"><TrashIcon /></button>
                    <Input label="Degree / Certificate" value={edu.degree} onChange={e => handleChange('education', 'degree', e.target.value, edu.id)} />
                    <Input label="University / Institution" value={edu.university} onChange={e => handleChange('education', 'university', e.target.value, edu.id)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Location" value={edu.location} onChange={e => handleChange('education', 'location', e.target.value, edu.id)} />
                        <Input label="Graduation Date" value={edu.gradDate} onChange={e => handleChange('education', 'gradDate', e.target.value, edu.id)} />
                    </div>
                </div>
            ))}
            <button onClick={addEducation} className="flex items-center gap-2 mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"><PlusIcon /> Add Education</button>
        </AccordionSection>

        <AccordionSection ref={certificatesSectionRef} title="Certificates" isOpen={openSections.includes('Certificates')} onToggle={() => toggleSection('Certificates')}>
            {(resumeData.certificates || []).map(cert => (
                <div key={cert.id} className="p-4 border rounded-md mb-4 space-y-4 bg-slate-50 relative">
                  <button onClick={() => removeCertificate(cert.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" title="Remove Certificate"><TrashIcon /></button>
                    <Input label="Certificate Name" value={cert.name} onChange={e => handleChange('certificates', 'name', e.target.value, cert.id)} />
                    <Input label="Issuing Organization" value={cert.issuer} onChange={e => handleChange('certificates', 'issuer', e.target.value, cert.id)} />
                    <Input label="Date Issued" value={cert.date} onChange={e => handleChange('certificates', 'date', e.target.value, cert.id)} />
                </div>
            ))}
            <button onClick={addCertificate} className="flex items-center gap-2 mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"><PlusIcon /> Add Certificate</button>
        </AccordionSection>
        
        <AccordionSection title="Skills" isOpen={openSections.includes('Skills')} onToggle={() => toggleSection('Skills')}>
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Skills</label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                    {resumeData.skills.map((skill) => (
                    <span key={skill} className="flex items-center gap-1.5 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-full">
                        {skill}
                        <button 
                            onClick={() => removeSkill(skill)} 
                            className="text-blue-600 hover:text-blue-800 focus:outline-none"
                            aria-label={`Remove ${skill}`}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        </button>
                    </span>
                    ))}
                    <input
                        type="text"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        placeholder={resumeData.skills.length === 0 ? "Add skills (e.g., React, Node.js)" : "Add another skill"}
                        className="flex-grow p-1 text-sm bg-transparent focus:outline-none min-w-[150px]"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter or comma to add a skill.</p>
            </div>
        </AccordionSection>
    </div>
  );
};

export default ResumeForm;