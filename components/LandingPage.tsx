import React, { useRef } from 'react';
import { ArrowRightIcon, ArrowUpTrayIcon, BullseyeIcon, CheckBadgeIcon, CpuChipIcon, DownloadIcon, SparklesIcon } from './icons';

interface LandingPageProps {
    onStartBuilding: () => void;
    onUploadResume: (file: File) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary animate-float hover:[animation-play-state:paused]">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-primary mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{children}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStartBuilding, onUploadResume }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onUploadResume(file);
        }
    };

    return (
        <div className="bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary"/>
                        Intelligent Resume Generator
                    </h1>
                    <button 
                        onClick={onStartBuilding}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors hidden sm:block"
                    >
                        Start Building
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-white">
                <div className="container mx-auto px-6 py-20 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                        Craft a Job-Winning Resume in Minutes
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Leverage the power of AI to generate, optimize, and tailor your resume for any job description. Stand out from the competition and land your dream job faster.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button 
                            onClick={onStartBuilding}
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg text-lg inline-flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                        >
                            Get Started for Free <ArrowRightIcon className="w-5 h-5"/>
                        </button>
                        <button 
                            onClick={handleUploadClick}
                            className="bg-white hover:bg-slate-100 text-primary font-bold py-3 px-8 rounded-lg text-lg inline-flex items-center gap-2 transition-colors border border-primary"
                        >
                            <ArrowUpTrayIcon className="w-5 h-5"/> Upload Resume
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,text/plain"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-800">Why Choose Our AI Resume Builder?</h3>
                        <p className="text-gray-600 mt-2">Everything you need to create a professional resume that gets results.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard icon={<CpuChipIcon />} title="AI-Powered Content">
                            Generate compelling summary and experience bullet points instantly. Overcome writer's block and showcase your achievements effectively.
                        </FeatureCard>
                        <FeatureCard icon={<BullseyeIcon />} title="Job Description Matcher">
                            Analyze your resume against any job description to get a match score and actionable feedback for improvement.
                        </FeatureCard>
                        <FeatureCard icon={<CheckBadgeIcon />} title="ATS-Friendly Design">
                            Create a resume optimized for Applicant Tracking Systems. Our templates ensure your application gets seen by recruiters.
                        </FeatureCard>
                        <FeatureCard icon={<DownloadIcon />} title="Multiple Export Options">
                            Download your finished resume as a professional PDF, DOCX, or HTML file, ready to be sent to employers.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-white py-20">
                 <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-800">Simple, Fast, and Effective</h3>
                        <p className="text-gray-600 mt-2">Create your perfect resume in three easy steps.</p>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                        <div className="text-center max-w-xs">
                            <div className="text-4xl font-bold text-primary bg-blue-100 w-16 h-16 mx-auto flex items-center justify-center rounded-full mb-4">1</div>
                            <h4 className="text-xl font-semibold mb-2">Input Your Details</h4>
                            <p className="text-gray-600">Fill in our intuitive form with your personal, professional, and educational background.</p>
                        </div>
                         <div className="text-center max-w-xs">
                            <div className="text-4xl font-bold text-primary bg-blue-100 w-16 h-16 mx-auto flex items-center justify-center rounded-full mb-4">2</div>
                            <h4 className="text-xl font-semibold mb-2">Enhance with AI</h4>
                            <p className="text-gray-600">Use our AI tools to generate content, find missing keywords, and suggest relevant skills.</p>
                        </div>
                         <div className="text-center max-w-xs">
                            <div className="text-4xl font-bold text-primary bg-blue-100 w-16 h-16 mx-auto flex items-center justify-center rounded-full mb-4">3</div>
                            <h4 className="text-xl font-semibold mb-2">Export & Apply</h4>
                            <p className="text-gray-600">Download your tailored resume and confidently apply for your next big opportunity.</p>
                        </div>
                    </div>
                </div>
            </section>

             {/* Final CTA Section */}
            <section className="relative container mx-auto px-6 py-20 text-center overflow-hidden">
                <div className="absolute bottom-0 left-0 w-auto h-24 animate-walk-across z-0 flex items-end">
                    <svg viewBox="0 0 50 80" className="w-10 h-auto text-gray-500">
                        <title>Cartoon person walking with a briefcase</title>
                         {/* Back Arm (Left) - swings opposite to front leg */}
                        <g style={{ transformOrigin: '25px 28px' }} className="animate-walk-arm-left">
                            <path d="M25 28 L17 34 L10 40" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                        </g>

                        {/* Back Leg (Left) - swings opposite to front leg */}
                        <g style={{ transformOrigin: '25px 45px' }} className="animate-walk-leg-left">
                            <path d="M25 45 L20 80" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                        </g>
                        
                        {/* Torso & Head */}
                        <g>
                            <path d="M19,45 L17,20 L25,28 L33,20 L31,45 Z" fill="currentColor" />
                            <circle cx="25" cy="10" r="8" fill="currentColor" />
                            {/* Nose pointing to the right */}
                            <path d="M32.5,9.5 l2,1 l-2,1 z" fill="currentColor" />
                        </g>

                        {/* Front Leg (Right) */}
                        <g style={{ transformOrigin: '25px 45px' }} className="animate-walk-leg-right">
                            <path d="M25 45 L30 80" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                        </g>

                        {/* Front Arm & Briefcase (Right) */}
                        <g style={{ transformOrigin: '25px 28px' }} className="animate-walk-arm-right">
                            <path d="M25 28 L33 34 L40 40" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                            <path d="M42.5 40 V 45" stroke="currentColor" strokeWidth="2" />
                            <rect x="35" y="45" width="15" height="10" rx="2" fill="currentColor" />
                        </g>
                    </svg>
                    <span className="ml-4 text-lg italic text-gray-600 animate-follow-text whitespace-nowrap">
                        ...off to work
                    </span>
                </div>

                <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-gray-800">Ready to Land Your Dream Job?</h3>
                    <p className="mt-3 text-gray-600 max-w-xl mx-auto">
                        Stop guessing what recruiters want to see. Start building a resume that opens doors.
                    </p>
                    <button 
                        onClick={onStartBuilding}
                        className="mt-8 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg text-lg inline-flex items-center gap-2 transition-transform duration-300 hover:scale-105"
                    >
                        Build My Resume Now <ArrowRightIcon className="w-5 h-5"/>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t">
                <div className="container mx-auto px-6 py-4 text-center text-gray-500">
                    &copy; {new Date().getFullYear()} Intelligent Resume Generator. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;