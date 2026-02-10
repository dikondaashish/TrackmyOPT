"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Phone, Mail, MapPin, Youtube, Globe, Linkedin, Github, ZoomIn, ZoomOut, Maximize } from "lucide-react";

export interface TemplateColor {
    name: string;
    class: string; // Tailwind gradient or bg class
    ring: string; // Ring color for selection
}

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    isPremium: boolean;
    preview: string; // Default preview class
    colors: TemplateColor[];
}

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template | null;
    onSelect: (templateId: string, color: TemplateColor) => void;
}

export function TemplatePreviewModal({ isOpen, onClose, template, onSelect }: TemplatePreviewModalProps) {
    const [selectedColor, setSelectedColor] = useState<TemplateColor | null>(null);
    const [scale, setScale] = useState(0.65); // Default zoom scale (65%)

    if (!template) return null;

    // Set default color when template changes
    if (!selectedColor && template.colors.length > 0) {
        setSelectedColor(template.colors[0]);
    }

    const currentColor = selectedColor || template.colors[0];

    const renderPreviewContent = () => {
        if (template.id === 'modern') {
            return (
                <div
                    className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl transition-all duration-300 origin-top overflow-hidden"
                    style={{
                        minHeight: '1131px',
                        fontFamily: '"Source Sans Pro", sans-serif',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * 1131}px` // Negative margin to reduce white space
                    }}
                >
                    <div className="p-10 text-gray-900 h-full flex flex-col">
                        {/* Modern Header */}
                        <div className="border-b-[3px] border-[#3D5A80] pb-2 mb-6">
                            <div className="grid grid-cols-3 items-end">
                                <div className="text-left text-sm space-y-0.5 leading-snug">
                                    <div>(xxx) xxx-xxxx</div>
                                    <div>somewhere, state</div>
                                    <div className="text-[#3D5A80] font-medium">yourname@gmail.com</div>
                                </div>
                                <div className="text-center">
                                    <h1 className="text-5xl font-['Montserrat'] font-bold uppercase tracking-tighter text-gray-900 mb-1">Your Name</h1>
                                    <div className="text-[#3D5A80] text-xl font-semibold tracking-wide uppercase">Data Scientist / Junior Developer</div>
                                </div>
                                <div className="text-right text-sm space-y-0.5 leading-snug">
                                    <div>Portfolio: <span className="text-[#3D5A80] font-medium">MathtoData.com</span></div>
                                    <div className="text-[#3D5A80] font-medium">github.com/TimmyChan</div>
                                    <div className="text-[#3D5A80] font-medium">linkedin.com/in/timmy-l-chan</div>
                                </div>
                            </div>
                        </div>

                        {/* Modern Content */}
                        <div className="space-y-5 flex-1">
                            <div className="text-[10pt] leading-relaxed text-gray-800">
                                <p>A data scientist with 2 years of experience in data analysis and machine learning... [Objective Placeholder]</p>
                            </div>
                            <div>
                                <h2 className="text-[#3D5A80] text-lg font-bold uppercase tracking-wide border-b border-gray-300 mb-2 flex items-center">Skills</h2>
                                <div className="text-sm grid grid-cols-[100px_1fr] gap-y-1 gap-x-4">
                                    <span className="font-bold">Languages</span><span>Python, R, SQL, LaTeX, Java, C++</span>
                                    <span className="font-bold">Libraries</span><span>pandas, numpy, scikit-learn, matplotlib, torch</span>
                                    <span className="font-bold">Tools</span><span>Git, Docker, AWS, Jupyter, Tableau</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-[#3D5A80] text-lg font-bold uppercase tracking-wide border-b border-gray-300 mb-3 flex items-center">Technical Experience</h2>
                                <div className="space-y-4">
                                    <div className="text-sm">
                                        <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base">Data Scientist</h3><span className="text-gray-600 font-medium">Jan 2022 - Present</span></div>
                                        <div className="italic text-gray-700 mb-1">Tech Company A, San Francisco, CA</div>
                                        <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-500"><li>Developed machine learning models to predict user churn with 85% accuracy.</li><li>Analyzed large datasets using Python and SQL to identify key business trends.</li></ul>
                                    </div>
                                    <div className="text-sm">
                                        <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base">Research Assistant</h3><span className="text-gray-600 font-medium">Sep 2020 - Dec 2021</span></div>
                                        <div className="italic text-gray-700 mb-1">University Lab, Boston, MA</div>
                                        <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-500"><li>Conducted research on natural language processing algorithms.</li><li>Published findings in a top-tier conference.</li></ul>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-[#3D5A80] text-lg font-bold uppercase tracking-wide border-b border-gray-300 mb-3 flex items-center">Education</h2>
                                <div className="text-sm">
                                    <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base">Master of Science in Data Science</h3><span className="text-gray-600 font-medium">May 2022</span></div>
                                    <div className="italic text-gray-700">University of Technology, City, State</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (template.id === 'professional') {
            return (
                <div
                    className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl transition-all duration-300 origin-top overflow-hidden"
                    style={{
                        minHeight: '1131px',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * 1131}px`
                    }}
                >
                    <div className="p-12 text-gray-900 h-full flex flex-col">
                        {/* Professional Header */}
                        <div className="text-center mb-6">
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Harshibar</h1>
                            <div className="flex justify-center items-center gap-3 text-sm text-gray-800">
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 555.555.5555</span>
                                <span className="text-gray-400">|</span>
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> hello@email.com</span>
                                <span className="text-gray-400">|</span>
                                <span className="flex items-center gap-1"><Youtube className="w-3 h-3" /> harshibar</span>
                                <span className="text-gray-400">|</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> U.S. Citizen</span>
                            </div>
                        </div>

                        {/* Professional Content */}
                        <div className="space-y-6">
                            {/* Experience */}
                            <div>
                                <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-3">EXPERIENCE</h2>
                                <div className="space-y-4">
                                    <div className="text-sm">
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>YouTube</span>
                                            <span>Aug. 2019 -- Present</span>
                                        </div>
                                        <div className="flex justify-between italic text-gray-700 mb-1">
                                            <span>Creator (@harshibar)</span>
                                            <span>San Francisco, CA</span>
                                        </div>
                                        <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                            <li>Grew channel to <strong>60k subscribers in 1.5 years</strong>; created 80+ videos on tech and productivity</li>
                                            <li>Conducted A/B testing on titles and thumbnails; <strong>increased video impressions by 2.5M</strong> in 3 months</li>
                                            <li>Designed a Notion workflow to streamline video production and roadmapping; boosted productivity by 20%</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Projects */}
                            <div>
                                <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-3">PROJECTS</h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="flex justify-between font-bold text-gray-900 mb-1">
                                            <span>Hyku Consulting</span>
                                            <span>Sept. 2019 -- Mar. 2021</span>
                                        </div>
                                        <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                            <li>Mentored 15 students towards acceptance at top US boarding schools; achieved <strong>100% success rate</strong></li>
                                            <li>Designed a <strong>collaborative learning ecosystem</strong> for students and parents with Trello, Miro, and Google Suite</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Education */}
                            <div>
                                <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-3">EDUCATION</h2>
                                <div className="text-sm">
                                    <div className="flex justify-between font-bold text-gray-900">
                                        <span>Wellesley College</span>
                                        <span>Aug. 2014 -- May 2018</span>
                                    </div>
                                    <div className="flex justify-between italic text-gray-700 mb-1">
                                        <span>Bachelor of Arts in Computer Science and Pre-Med</span>
                                        <span>Wellesley, MA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-3">SKILLS</h2>
                                <div className="text-sm text-gray-800 space-y-1">
                                    <div><span className="font-bold">Languages:</span> Python, JavaScript (React.js), HTML/CSS, SQL (PostgreSQL, MySQL)</div>
                                    <div><span className="font-bold">Tools:</span> Figma, Notion, Jira, Trello, Miro, Google Analytics, GitHub</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (template.id === 'creative') {
            return (
                <div
                    className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl transition-all duration-300 origin-top overflow-hidden"
                    style={{
                        minHeight: '1131px',
                        fontFamily: '"Georgia", "Times New Roman", serif',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * 1131}px`
                    }}
                >
                    <div className="p-10 text-gray-900 h-full flex flex-col">
                        {/* Creative Header - 2 Columns */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-blue-800 mb-1">Sourabh Bajaj</h1>
                                <a href="#" className="text-blue-600 text-sm block hover:underline">http://www.sourabhbajaj.com</a>
                            </div>
                            <div className="text-right text-sm">
                                <div>Email : <a href="#" className="text-blue-600 hover:underline">mail@website.com</a></div>
                                <div>Mobile : +1-123-456-7890</div>
                            </div>
                        </div>

                        {/* Creative Content */}
                        <div className="space-y-6">

                            {/* Education */}
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Education</h2>
                                <div className="space-y-4">
                                    <div className="text-sm">
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Georgia Institute of Technology</span>
                                            <span>Aug. 2012 -- Dec. 2013</span>
                                        </div>
                                        <div className="flex justify-between italic text-gray-700">
                                            <span>Master of Science in Computer Science; GPA: 4.00</span>
                                            <span>Atlanta, GA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Experience</h2>
                                <div className="space-y-5">
                                    <div className="text-sm">
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Google</span>
                                            <span>Oct 2016 - Present</span>
                                        </div>
                                        <div className="flex justify-between italic text-gray-700 mb-2">
                                            <span>Software Engineer</span>
                                            <span>Mountain View, CA</span>
                                        </div>
                                        <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                            <li><span className="font-bold">Tensorflow:</span> TensorFlow is an open source software library for numerical computation using data flow graphs.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Projects */}
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Projects</h2>
                                <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                                    <li><span className="font-bold">QuantSoftware Toolkit:</span> Open source python library for financial data analysis.</li>
                                </ul>
                            </div>

                            {/* Skills */}
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Programming Skills</h2>
                                <div className="text-sm text-gray-800">
                                    <span className="font-bold">Languages:</span> Scala, Python, Javascript, C++, SQL, Java
                                    <span className="mx-4 text-gray-400">|</span>
                                    <span className="font-bold">Technologies:</span> AWS, Play, React, Kafka, GCE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (template.id === 'academic') {
            return (
                <div
                    className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl transition-all duration-300 origin-top overflow-hidden"
                    style={{
                        minHeight: '1131px',
                        fontFamily: '"Times New Roman", Times, serif',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * 1131}px`
                    }}
                >
                    <div className="p-10 text-gray-900 h-full flex flex-col">
                        {/* Academic Header */}
                        <div className="flex justify-between items-start mb-6 border-b-0">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">Vidushi Wahal</h1>
                            </div>
                            <div className="text-right text-sm">
                                <div>Email : <a href="#" className="text-blue-600 hover:underline">vidushi22@gmail.com</a></div>
                                <div>Mobile : +91-9811405837</div>
                            </div>
                        </div>

                        {/* Academic Content */}
                        <div className="space-y-6">

                            {/* Professional Summary */}
                            <div>
                                <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Professional Summary</h2>
                                <ul className="list-disc ml-5 space-y-2 text-sm text-gray-800">
                                    <li><span className="font-bold">Experience: </span>6+ years of diverse experience in Information Technology.</li>
                                </ul>
                            </div>

                            {/* Experience */}
                            <div>
                                <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Experience</h2>
                                <div className="space-y-5">
                                    <div className="text-sm">
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>G4S Technologies</span>
                                            <span>Gurgaon, Haryana</span>
                                        </div>
                                        <div className="flex justify-between italic text-gray-700 mb-2">
                                            <span>Senior QA Engineer</span>
                                            <span>Oct 2016 - Present</span>
                                        </div>
                                        <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                            <li><span className="font-bold">Project: </span>Javelin - G4S End To End ERP Business Application</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Programming Skills */}
                            <div>
                                <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Programming Skills</h2>
                                <ul className="list-disc ml-5 space-y-2 text-sm text-gray-800">
                                    <li><span className="font-bold">Languages</span>: C#, Java, Javascript, SQL, Groovy</li>
                                </ul>
                            </div>

                            {/* Education */}
                            <div>
                                <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Education</h2>
                                <div className="space-y-4">
                                    <div className="text-sm">
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Apeejay College Of Engineering</span>
                                            <span>Gurgaon, Haryana</span>
                                        </div>
                                        <div className="flex justify-between italic text-gray-700">
                                            <span>Bachelor of Technology in IT; Percentage: 67</span>
                                            <span>Aug. 2008 -- Dec. 2012</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (template.id === 'executive') {
            return (
                <div
                    className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl transition-all duration-300 origin-top overflow-hidden"
                    style={{
                        minHeight: '1131px',
                        fontFamily: '"Lato", "Inter", sans-serif',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * 1131}px`
                    }}
                >
                    <div className="p-12 text-gray-900 h-full flex flex-col">
                        {/* Executive Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-light tracking-widest text-gray-900 uppercase mb-3 text-gray-900">Audric Serador</h1>
                            <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> City, State</span>
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 555-555-5555</span>
                                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> email@example.com</span>
                                <span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" /> linkedin.com/in/audric</span>
                                <span className="flex items-center gap-1"><Github className="w-3.5 h-3.5" /> github.com/audric</span>
                            </div>
                        </div>

                        {/* Executive Content */}
                        <div className="space-y-6">

                            {/* Education */}
                            <div>
                                <h2 className="text-xl font-light uppercase tracking-widest border-b border-gray-900 pb-1 mb-4 text-gray-900">Education</h2>
                                <div className="text-sm">
                                    <div className="flex justify-between font-bold text-gray-900 text-base">
                                        <span>University Name</span>
                                        <span>City, State</span>
                                    </div>
                                    <div className="flex justify-between italic text-gray-700 mb-1">
                                        <span>Bachelor of Science in Computer Science</span>
                                        <span>Aug 2018 -- May 2022</span>
                                    </div>
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <h2 className="text-xl font-light uppercase tracking-widest border-b border-gray-900 pb-1 mb-4 text-gray-900">Experience</h2>
                                <div className="space-y-6">
                                    <div className="text-sm">
                                        <div className="flex justify-between font-bold text-gray-900 text-base">
                                            <span>Company Name</span>
                                            <span>City, State</span>
                                        </div>
                                        <div className="flex justify-between italic text-gray-700 mb-2">
                                            <span>Software Engineer Intern</span>
                                            <span>May 2021 -- Aug 2021</span>
                                        </div>
                                        <ul className="list-disc ml-5 space-y-1.5 text-gray-800 leading-relaxed">
                                            <li>Developed a full-stack web application using React, Node.js, and PostgreSQL.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Projects */}
                            <div>
                                <h2 className="text-xl font-light uppercase tracking-widest border-b border-gray-900 pb-1 mb-4 text-gray-900">Projects</h2>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <div className="flex justify-between font-bold text-gray-900 text-base mb-1">
                                            <span>Project Name</span>
                                            <span>Jan 2021 -- Present</span>
                                        </div>
                                        <ul className="list-disc ml-5 space-y-1.5 text-gray-800 leading-relaxed">
                                            <li>Built a mobile application using Flutter and Firebase.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div>
                                <h2 className="text-xl font-light uppercase tracking-widest border-b border-gray-900 pb-1 mb-4 text-gray-900">Technical Skills</h2>
                                <div className="text-sm text-gray-800 space-y-1">
                                    <div><span className="font-bold">Languages:</span> Java, Python, C++, SQL, JavaScript</div>
                                    <div><span className="font-bold">Frameworks:</span> React, Node.js, Flask, JUnit, WordPress</div>
                                    <div><span className="font-bold">Developer Tools:</span> Git, Docker, TravisCI, Google Cloud Platform, VS Code</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            );
        }

        if (template.id === 'tech') {
            return (
                <div
                    className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl transition-all duration-300 origin-top overflow-hidden"
                    style={{
                        minHeight: '1131px',
                        fontFamily: '"Charter", "Bitstream Charter", "Georgia", serif',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * 1131}px`
                    }}
                >
                    <div className="p-10 text-gray-900 h-full flex flex-col">
                        {/* Tech Header */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">John Doe</h1>
                            <div className="flex justify-center items-center gap-3 text-sm text-gray-800">
                                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> johndoe@example.com</span>
                                <span className="text-gray-400">|</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Boston, Massachusetts</span>
                                <span className="text-gray-400">|</span>
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 555-123-4567</span>
                                <span className="text-gray-400">|</span>
                                <span className="flex items-center gap-1"><Linkedin className="w-3.5 h-3.5" /> linkedin.com/in/john-doe</span>
                            </div>
                        </div>

                        {/* Tech Content */}
                        <div className="space-y-5">

                            {/* Professional Summary */}
                            <div>
                                <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Professional Summary</h2>
                                <p className="text-sm text-gray-800 leading-relaxed">
                                    Results-driven <span className="font-bold">AI Solutions Engineer</span> with hands-on experience building production-grade AI systems, cloud integrations, and automation workflows. Adept at translating business requirements into scalable technical solutions.
                                </p>
                            </div>

                            {/* Education */}
                            <div>
                                <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Education</h2>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Example University — Master’s in Computer Science</span>
                                            <span>Aug 2022 – May 2024</span>
                                        </div>
                                        <div className="text-gray-700">Focus: Artificial Intelligence, Distributed Systems, Cloud Computing</div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Sample Institute of Technology — Bachelor of Computer Applications</span>
                                            <span>Aug 2018 – Jul 2022</span>
                                        </div>
                                        <div className="text-gray-700">Focus: Software Engineering, Databases, Web Technologies</div>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Skills */}
                            <div>
                                <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Technical Skills</h2>
                                <div className="text-sm text-gray-800 space-y-1">
                                    <div><span className="font-bold">Languages:</span> Python, JavaScript, Java, SQL, Go</div>
                                    <div><span className="font-bold">AI/ML:</span> LangChain, OpenAI API, TensorFlow, Scikit-learn</div>
                                    <div><span className="font-bold">Cloud Platforms:</span> AWS, GCP, Azure, Docker, Kubernetes</div>
                                    <div><span className="font-bold">Integration:</span> REST APIs, GraphQL, Webhooks, ETL Pipelines</div>
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Experience</h2>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>AI Solutions Engineer — Example AI Labs (Remote)</span>
                                            <span>Jan 2024 – Present</span>
                                        </div>
                                        <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                            <li>Designed and deployed AI-powered workflows for enterprise SaaS customers.</li>
                                            <li>Integrated large language models into production systems using REST and GraphQL APIs.</li>
                                            <li>Developed proof-of-concept demos supporting pre-sales and customer onboarding.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Integration Engineer — SampleCloud Technologies (Remote)</span>
                                            <span>Jun 2023 – Dec 2023</span>
                                        </div>
                                        <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                            <li>Built data integration pipelines across multi-cloud environments.</li>
                                            <li>Automated onboarding workflows, reducing setup time for new clients.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Projects */}
                            <div>
                                <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Projects</h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="font-bold text-gray-900">AI Support Agent Platform — Enterprise Prototype</div>
                                        <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                            <li>Built an AI-powered customer support agent using LangChain and GPT APIs.</li>
                                            <li>Integrated structured data sources for real-time query resolution.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">Cloud Data Integrator — Integration Framework</div>
                                        <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                            <li>Designed a reusable framework for syncing enterprise data systems.</li>
                                            <li>Automated ETL pipelines using Python microservices.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            );
        }

        // Default or Fallback (Text-only of ID)
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Preview not available for {template.name}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent onClose={onClose} className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-white dark:bg-gray-950 flex flex-col md:flex-row gap-0">
                {/* Close Button (Absolute) */}


                {/* Left: Preview Area (Scrollable) */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto overflow-x-hidden p-8 relative flex flex-col items-center">
                    {/* Zoom Controls */}
                    <div className="sticky top-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 mb-8 transition-opacity hover:opacity-100 opacity-60">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setScale(Math.max(0.3, scale - 0.1))}
                            disabled={scale <= 0.3}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setScale(Math.min(1.5, scale + 0.1))}
                            disabled={scale >= 1.5}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setScale(0.65)}
                            title="Reset Zoom"
                        >
                            <Maximize className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Preview Content Container */}
                    <div className="w-full flex justify-center min-h-0">
                        {renderPreviewContent()}
                    </div>
                </div>

                {/* Right: Customization Sidebar */}
                <div className="w-full md:w-[350px] bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 flex flex-col h-full">
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="mb-6">
                            <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase mb-1 block">
                                {template.category}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {template.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {template.description}
                            </p>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mb-8">
                            {/* Color Theme selection removed as requested */}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                Features
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    ATS-Optimized Layout
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Smart Section Organization
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Professional Typography
                                </li>
                                {template.isPremium && (
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-amber-500" />
                                        Premium Design Elements
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <Button
                            onClick={() => onSelect(template.id, currentColor)}
                            className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                        >
                            Use This Template
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            You can customize sections in the next step
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
