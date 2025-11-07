
import React from 'react';
import { ResumeData, Template, Font } from '../types';

interface ResumePreviewProps {
  resumeData: ResumeData;
  selectedTemplate: Template;
  setSelectedTemplate: (template: Template) => void;
  selectedFont: Font;
  setSelectedFont: (font: Font) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
}

const templates: Template[] = ['classic', 'modern', 'minimalist'];
const fonts: Font[] = ['Arial', 'Georgia', 'Verdana', 'Times New Roman'];

const ClassicTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
    <div className="p-8 border rounded-md font-serif bg-white" id="resume-preview">
        <div style={{ borderColor: 'var(--secondary-color)' }} className="text-center border-b pb-4">
            <h1 style={{ color: 'var(--primary-color)' }} className="text-4xl font-bold tracking-wider">{resumeData.personalInfo.name}</h1>
            <p className="mt-2 text-sm">{resumeData.personalInfo.email} | {resumeData.personalInfo.phone} | {resumeData.personalInfo.linkedin} {resumeData.personalInfo.website && `| ${resumeData.personalInfo.website}`}</p>
        </div>
        <div className="mt-6"><h2 style={{ borderColor: 'var(--secondary-color)' }} className="text-lg font-bold border-b-2 inline-block mb-2">PROFESSIONAL SUMMARY</h2><p className="text-sm">{resumeData.summary}</p></div>
        <div className="mt-6">
            <h2 style={{ borderColor: 'var(--secondary-color)' }} className="text-lg font-bold border-b-2 inline-block mb-2">WORK EXPERIENCE</h2>
            {resumeData.experience.map(exp => (
                <div key={exp.id} className="mb-4">
                    <div className="flex justify-between items-baseline"><h3 className="text-md font-bold">{exp.title}</h3><p className="text-sm font-light">{exp.startDate} – {exp.endDate}</p></div>
                    <div className="flex justify-between items-baseline"><p className="text-md italic">{exp.company}</p><p className="text-sm font-light">{exp.location}</p></div>
                    <ul className="list-disc pl-5 mt-1">{exp.description.split('\n').map((line, i) => line.trim() ? <li key={i} className="text-sm my-1">{line.replace(/^•\s*/, '')}</li> : null)}</ul>
                </div>
            ))}
        </div>
        <div className="mt-6">
            <h2 style={{ borderColor: 'var(--secondary-color)' }} className="text-lg font-bold border-b-2 inline-block mb-2">EDUCATION</h2>
            {resumeData.education.map(edu => (
                <div key={edu.id} className="mb-2">
                    <div className="flex justify-between items-baseline"><h3 className="text-md font-bold">{edu.degree}</h3><p className="text-sm font-light">{edu.gradDate}</p></div>
                    <p className="text-md italic">{edu.university}, {edu.location}</p>
                </div>
            ))}
        </div>
        {resumeData.certificates && resumeData.certificates.length > 0 && (
            <div className="mt-6">
                <h2 style={{ borderColor: 'var(--secondary-color)' }} className="text-lg font-bold border-b-2 inline-block mb-2">CERTIFICATES</h2>
                {resumeData.certificates.map(cert => (
                    <div key={cert.id} className="mb-2">
                        <div className="flex justify-between items-baseline"><h3 className="text-md font-bold">{cert.name}</h3><p className="text-sm font-light">{cert.date}</p></div>
                        <p className="text-md italic">{cert.issuer}</p>
                    </div>
                ))}
            </div>
        )}
        <div className="mt-6"><h2 style={{ borderColor: 'var(--secondary-color)' }} className="text-lg font-bold border-b-2 inline-block mb-2">SKILLS</h2><p className="text-sm">{resumeData.skills.join(' | ')}</p></div>
    </div>
);

const ModernTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
    <div className="bg-white rounded-md font-sans flex" id="resume-preview">
        {/* Left Column (Sidebar) */}
        <div className="w-1/3 bg-gray-50 p-6 text-gray-800 rounded-l-md">
            <div className="text-center mb-8">
                <h1 style={{ color: 'var(--primary-color)' }} className="text-3xl font-bold tracking-tight">{resumeData.personalInfo.name}</h1>
            </div>
            
            <div>
                <h2 style={{ color: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }} className="text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1">Contact</h2>
                <div className="text-sm space-y-1">
                    <p className="break-words"><strong>Email:</strong> {resumeData.personalInfo.email}</p>
                    <p><strong>Phone:</strong> {resumeData.personalInfo.phone}</p>
                    <p className="break-words"><strong>LinkedIn:</strong> {resumeData.personalInfo.linkedin}</p>
                    {resumeData.personalInfo.website && <p className="break-words"><strong>Website:</strong> {resumeData.personalInfo.website}</p>}
                </div>
            </div>

            <div className="mt-6">
                <h2 style={{ color: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }} className="text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1">Summary</h2>
                <p className="text-sm text-gray-700">{resumeData.summary}</p>
            </div>
            
            <div className="mt-6">
                <h2 style={{ color: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }} className="text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1">Skills</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                    {resumeData.skills.map(skill => (
                        <span key={skill} className="bg-slate-200 text-slate-700 text-xs font-medium px-2 py-1 rounded">{skill}</span>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column (Main Content) */}
        <div className="w-2/3 p-8">
            <div>
                <h2 style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} className="text-xl font-semibold uppercase tracking-wider mb-4 border-b-2 pb-2">Experience</h2>
                {resumeData.experience.map(exp => (
                    <div key={exp.id} className="mb-5">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-bold text-gray-800">{exp.title}</h3>
                            <p className="text-sm text-gray-500 font-medium whitespace-nowrap pl-4">{exp.startDate} – {exp.endDate}</p>
                        </div>
                        <p className="text-md italic text-gray-600">{exp.company}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            {exp.description.split('\n').map((line, i) => line.trim() ? <li key={i} className="text-sm text-gray-700">{line.replace(/^•\s*/, '')}</li> : null)}
                        </ul>
                    </div>
                ))}
            </div>
            
            <div className="mt-6">
                <h2 style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} className="text-xl font-semibold uppercase tracking-wider mb-4 border-b-2 pb-2">Education</h2>
                {resumeData.education.map(edu => (
                    <div key={edu.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                             <div>
                                <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                                <p className="text-md italic text-gray-600">{edu.university}</p>
                            </div>
                            <p className="text-sm text-gray-500 font-medium whitespace-nowrap pl-4">{edu.gradDate}</p>
                        </div>
                    </div>
                ))}
            </div>
            {resumeData.certificates && resumeData.certificates.length > 0 && (
                <div className="mt-6">
                    <h2 style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }} className="text-xl font-semibold uppercase tracking-wider mb-4 border-b-2 pb-2">CERTIFICATES</h2>
                    {resumeData.certificates.map(cert => (
                        <div key={cert.id} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{cert.name}</h3>
                                    <p className="text-md italic text-gray-600">{cert.issuer}</p>
                                </div>
                                <p className="text-sm text-gray-500 font-medium whitespace-nowrap pl-4">{cert.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const MinimalistTemplate: React.FC<{ resumeData: ResumeData }> = ({ resumeData }) => (
    <div className="p-8 bg-white rounded-md font-sans" id="resume-preview">
        <div className="text-center pb-6">
            <h1 style={{ color: 'var(--primary-color)' }} className="text-3xl font-light tracking-widest uppercase">{resumeData.personalInfo.name}</h1>
            <p style={{ color: 'var(--secondary-color)' }} className="mt-2 text-xs tracking-wider">{resumeData.personalInfo.email} • {resumeData.personalInfo.phone} • {resumeData.personalInfo.linkedin}</p>
        </div>
        <div className="mt-4"><p className="text-sm text-center text-gray-600">{resumeData.summary}</p></div>
        <div className="mt-8">
            <h2 style={{ color: 'var(--secondary-color)' }} className="text-xs font-semibold uppercase tracking-widest text-center mb-4">Experience</h2>
            {resumeData.experience.map(exp => (
                <div key={exp.id} className="mb-5">
                    <div className="flex justify-between items-baseline text-md">
                        <h3 className="font-semibold text-gray-800">{exp.title}</h3>
                        <span className="text-sm font-light text-gray-500">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <ul className="list-disc pl-5 mt-1">{exp.description.split('\n').map((line, i) => line.trim() ? <li key={i} className="text-xs my-1 text-gray-600">{line.replace(/^•\s*/, '')}</li> : null)}</ul>
                </div>
            ))}
        </div>
        <div className="mt-8">
            <h2 style={{ color: 'var(--secondary-color)' }} className="text-xs font-semibold uppercase tracking-widest text-center mb-4">Education</h2>
            {resumeData.education.map(edu => (
                <div key={edu.id} className="mb-2 flex justify-between items-baseline text-md">
                    <div><h3 className="font-semibold text-gray-800">{edu.degree}</h3><p className="text-sm text-gray-600">{edu.university}</p></div>
                    <span className="text-sm font-light text-gray-500">{edu.gradDate}</span>
                </div>
            ))}
        </div>
        {resumeData.certificates && resumeData.certificates.length > 0 && (
            <div className="mt-8">
                <h2 style={{ color: 'var(--secondary-color)' }} className="text-xs font-semibold uppercase tracking-widest text-center mb-4">Certificates</h2>
                {resumeData.certificates.map(cert => (
                    <div key={cert.id} className="mb-2 flex justify-between items-baseline text-md">
                        <div><h3 className="font-semibold text-gray-800">{cert.name}</h3><p className="text-sm text-gray-600">{cert.issuer}</p></div>
                        <span className="text-sm font-light text-gray-500">{cert.date}</span>
                    </div>
                ))}
            </div>
        )}
        <div className="mt-8">
            <h2 style={{ color: 'var(--secondary-color)' }} className="text-xs font-semibold uppercase tracking-widest text-center mb-4">Skills</h2>
            <p className="text-sm text-center text-gray-600">{resumeData.skills.join(' • ')}</p>
        </div>
    </div>
);

const ResumePreview: React.FC<ResumePreviewProps> = ({ 
    resumeData, 
    selectedTemplate, 
    setSelectedTemplate, 
    selectedFont, 
    setSelectedFont,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg" id="resume-container">
      <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-4">
        <h3 className="text-xl font-semibold text-gray-700">Live Preview</h3>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
                <label htmlFor="primary-color" className="text-sm font-medium text-gray-600">Primary</label>
                <input id="primary-color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-7 h-7 p-0.5 border border-gray-300 rounded-md cursor-pointer" title="Primary Color"/>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="secondary-color" className="text-sm font-medium text-gray-600">Secondary</label>
                <input id="secondary-color" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-7 h-7 p-0.5 border border-gray-300 rounded-md cursor-pointer" title="Secondary Color"/>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="font-select" className="text-sm font-medium text-gray-600">Font</label>
              <select
                id="font-select"
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value as Font)}
                className="bg-slate-100 p-1 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary border-transparent"
              >
                {fonts.map(font => <option key={font} value={font}>{font}</option>)}
              </select>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {templates.map(template => (
                    <button
                        key={template}
                        onClick={() => setSelectedTemplate(template)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize ${
                            selectedTemplate === template
                                ? 'bg-primary text-white shadow'
                                : 'text-gray-600 hover:bg-slate-200'
                        }`}
                    >
                        {template}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      <div 
        id="resume-preview-content" 
        style={{ 
            fontFamily: selectedFont === 'Times New Roman' ? '"Times New Roman", Times, serif' : selectedFont,
            '--primary-color': primaryColor,
            '--secondary-color': secondaryColor,
        } as React.CSSProperties}
      >
        {selectedTemplate === 'classic' && <ClassicTemplate resumeData={resumeData} />}
        {selectedTemplate === 'modern' && <ModernTemplate resumeData={resumeData} />}
        {selectedTemplate === 'minimalist' && <MinimalistTemplate resumeData={resumeData} />}
      </div>
    </div>
  );
};

export default ResumePreview;