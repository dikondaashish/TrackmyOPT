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
            const pageHeight = 1131;
            const gap = 32;
            const totalHeight = pageHeight * 2 + gap;

            return (
                <div
                    className="w-full flex flex-col items-center transition-all duration-300 origin-top"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * totalHeight}px`
                    }}
                >
                    {/* Page 1 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Source Sans Pro", sans-serif' }}
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

                            {/* Modern Content Page 1 */}
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gap */}
                    <div className="h-8 w-full shrink-0" />

                    {/* Page 2 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Source Sans Pro", sans-serif' }}
                    >
                        <div className="p-10 text-gray-900 h-full flex flex-col">
                            {/* Modern Content Page 2 */}
                            <div className="space-y-5 flex-1">
                                <div>
                                    {/* <h2 className="text-[#3D5A80] text-lg font-bold uppercase tracking-wide border-b border-gray-300 mb-3 flex items-center">Technical Experience (Cont.)</h2> */}
                                    <div className="space-y-4">
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
                </div>
            );
        }

        if (template.id === 'professional') {
            const pageHeight = 1131;
            const gap = 32; // 2rem
            const totalHeight = pageHeight * 2 + gap;

            return (
                <div
                    className="w-full flex flex-col items-center transition-all duration-300 origin-top"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * totalHeight}px`
                    }}
                >
                    {/* Page 1 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: 'Helvetica, Arial, sans-serif' }}
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
                                                <li><strong>Partnered with brands like Skillshare and Squarespace</strong> to expand their outreach via sponsorships</li>
                                                <li><strong>Highlights</strong>: The Problem with Productivity Apps, Obsidian App Review, Not-So-Minimal Desk Setup</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Google Verily</span>
                                                <span>Aug. 2018 -- Sept. 2019</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-1">
                                                <span>Software Engineer</span>
                                                <span>San Francisco, CA</span>
                                            </div>
                                            <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                                <li><strong>Led front-end development</strong> of a dashboard to process 50k blood samples and detect early-stage cancer</li>
                                                <li>Rebuilt a Quality Control product with input from 20 cross-functional stakeholders, <strong>saving $1M annually</strong></li>
                                                <li>Spearheaded product development of a new lab workflow tool, leading to a 40% increase in efficiency; shadowed 10 core users, iterated on design docs, and implemented the solution with one engineer</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Amazon</span>
                                                <span>May 2017 -- Aug. 2017</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-1">
                                                <span>Software Engineering Intern</span>
                                                <span>Seattle, WA</span>
                                            </div>
                                            <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                                <li>Worked on the Search Customer Experience Team; <strong>received a return offer</strong> for a full-time position</li>
                                                <li><strong>Shipped a new feature to 2M+ users</strong> to improve the search experience for movie series-related queries</li>
                                                <li>Built a back-end database service in Java and implemented a front-end UI to support future changes</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                {/* Projects Part 1 */}
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
                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900 mb-1">
                                                <span>Minimal Icon Pack</span>
                                                <span>Sept. 2020 -- Nov. 2020</span>
                                            </div>
                                            <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                                <li>Designed and released 100+ minimal iOS and Android icons from scratch using Procreate and Figma</li>
                                                <li>Marketed the product and design process on YouTube; accumulated over <strong>$250 in sales</strong> on Gumroad</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page Break / Gap */}
                    <div className="h-8 w-full shrink-0" />

                    {/* Page 2 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: 'Helvetica, Arial, sans-serif' }}
                    >
                        <div className="p-12 text-gray-900 h-full flex flex-col">
                            <div className="space-y-6">
                                {/* Projects Part 2 */}
                                <div className="text-sm">
                                    <div>
                                        <div className="flex justify-between font-bold text-gray-900 mb-1">
                                            <span>CommonIntern</span>
                                            <span>Sept. 2019 -- May 2020</span>
                                        </div>
                                        <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                            <li>Built a Python script to automatically apply to jobs on Glassdoor using BeautifulSoup and Selenium</li>
                                            <li><strong>500 stars on GitHub</strong>; featured on Hackaday; made the front page of r/python and r/programming</li>
                                        </ul>
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
                                        <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                            <li><strong>Coursework</strong>: Data Structures, Algorithms, Databases, Computer Systems, Machine Learning</li>
                                            <li><strong>Research</strong>: MIT Graybiel Lab (published author), MIT Media Lab (analyzed urban microbe spread)</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-3">SKILLS</h2>
                                    <div className="text-sm text-gray-800 space-y-1">
                                        <div><span className="font-bold">Languages:</span> Python, JavaScript (React.js), HTML/CSS, SQL (PostgreSQL, MySQL)</div>
                                        <div><span className="font-bold">Tools:</span> Figma, Notion, Jira, Trello, Miro, Google Analytics, GitHub, DaVinci Resolve, OBS</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (template.id === 'creative') {
            const pageHeight = 1131;
            const gap = 32;
            const totalHeight = pageHeight * 2 + gap;

            return (
                <div
                    className="w-full flex flex-col items-center transition-all duration-300 origin-top"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * totalHeight}px`
                    }}
                >
                    {/* Page 1 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Georgia", "Times New Roman", serif' }}
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

                            {/* Creative Content Page 1 */}
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
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Birla Institute of Technology and Science</span>
                                                <span>Aug. 2008 -- July. 2012</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>Bachelor of Engineering in Electrical and Electronics; GPA: 3.66</span>
                                                <span>Pilani, India</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Experience (Part 1) */}
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
                                                <li><span className="font-bold">Tensorflow:</span> TensorFlow is an open source software library for numerical computation using data flow graphs; primarily used for training deep learning models.</li>
                                                <li><span className="font-bold">Apache Beam:</span> Apache Beam is a unified model for defining both batch and streaming data-parallel processing pipelines.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gap */}
                    <div className="h-8 w-full shrink-0" />

                    {/* Page 2 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Georgia", "Times New Roman", serif' }}
                    >
                        <div className="p-10 text-gray-900 h-full flex flex-col">
                            <div className="space-y-6">
                                {/* Experience (Part 2) */}
                                <div>
                                    {/* <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Experience (Cont.)</h2> */}
                                    <div className="space-y-5">
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Coursera</span>
                                                <span>Jan 2014 - Oct 2016</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Senior Software Engineer</span>
                                                <span>Mountain View, CA</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Notifications:</span> Service for sending email, push and in-app notifications. Involved in features such as delivery time optimization, tracking, queuing and A/B testing.</li>
                                                <li><span className="font-bold">Nostos:</span> Bulk data processing and injection service from Hadoop to Cassandra and provides a thin REST layer on top for serving offline computed data online.</li>
                                                <li><span className="font-bold">Workflows:</span> Dataduct an open source workflow framework to create and manage data pipelines leveraging reusables patterns to expedite developer productivity.</li>
                                                <li><span className="font-bold">Data Collection:</span> Designed the internal survey and crowd sourcing platform.</li>
                                                <li><span className="font-bold">Dev Environment:</span> Analytics environment based on docker and AWS, standardized the python and R dependencies.</li>
                                                <li><span className="font-bold">Data Warehousing:</span> Setup, schema design and management of Amazon Redshift.</li>
                                                <li><span className="font-bold">Recommendations:</span> Core service for all recommendation systems at Coursera.</li>
                                                <li><span className="font-bold">Content Discovery:</span> Improved content discovery by building a new onboarding experience.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Lucena Research</span>
                                                <span>Summer 2012 and 2013</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Data Scientist</span>
                                                <span>Atlanta, GA</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Portfolio Management:</span> Created models for portfolio hedging, portfolio optimization and price forecasting.</li>
                                                <li><span className="font-bold">QuantDesk:</span> Python backend for a web application used by hedge fund managers.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Projects */}
                                <div>
                                    <h2 className="text-lg font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Projects</h2>
                                    <ul className="list-disc ml-5 space-y-1 text-sm text-gray-800">
                                        <li><span className="font-bold">QuantSoftware Toolkit:</span> Open source python library for financial data analysis and machine learning for finance.</li>
                                        <li><span className="font-bold">Github Visualization:</span> Data Visualization of Git Log data using D3 to analyze project trends over time.</li>
                                        <li><span className="font-bold">Recommendation System:</span> Music and Movie recommender systems using collaborative filtering on public datasets.</li>
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
                </div>
            );
        }

        if (template.id === 'academic') {
            const pageHeight = 1131;
            const gap = 32;
            const totalHeight = pageHeight * 2 + gap;

            return (
                <div
                    className="w-full flex flex-col items-center transition-all duration-300 origin-top"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * totalHeight}px`
                    }}
                >
                    {/* Page 1 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Times New Roman", Times, serif' }}
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

                            {/* Academic Content Page 1 */}
                            <div className="space-y-6">

                                {/* Professional Summary */}
                                <div>
                                    <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Professional Summary</h2>
                                    <ul className="list-disc ml-5 space-y-2 text-sm text-gray-800">
                                        <li><span className="font-bold">Experience: </span>6+ years of diverse experience in Information Technology with emphasis on Software Quality Assurance (Automation and Manual Testing) for various domains like insurance, e-commerce, ERP.</li>
                                        <li><span className="font-bold">Responsibilities: </span>Involved in all phases of the SDLC and STLC, including requirements gathering, risk analysis, test planning, estimation, scheduling, execution, defect tracking, and reporting.</li>
                                        <li><span className="font-bold">Testing: </span>Experience in functional, non-functional, integration, regression, system, UAT, and risk based testing.</li>
                                        <li><span className="font-bold">Automation Exposure: </span>Specialization in designing Automation Frameworks for functional/regression testing in Codedui C# and Selenium (C#/Java), and SOAPUI for API testing.</li>
                                    </ul>
                                </div>

                                {/* Experience (Part 1) */}
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
                                                <li><span className="font-bold">Team Management: </span>Forming testing strategies, ensuring end to end application testing, daily regression and reporting.</li>
                                                <li><span className="font-bold">Requirement Gathering: </span>Working closely with BA and PFOs for Test Scenarios/Cases.</li>
                                                <li><span className="font-bold">Awards: </span>Silver Award (2018), Bronze (2018), multiple awards for support.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>On Demand Agility Software Solutions</span>
                                                <span>Gurgaon, Haryana</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Senior Software Engineer</span>
                                                <span>Jun 2014 - Oct 2016</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Project: </span>www.horizonhobby.com, www.forcerc.com - E-commerce</li>
                                                <li><span className="font-bold">Automation Framework: </span>Designing automation frameworks including reporting.</li>
                                                <li><span className="font-bold">Lead Roles: </span>Managing a team of 3, ensuring quality criteria met.</li>
                                                <li><span className="font-bold">Test Cases: </span>Creating automated test cases using CodedUI and Selenium.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gap */}
                    <div className="h-8 w-full shrink-0" />

                    {/* Page 2 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Times New Roman", Times, serif' }}
                    >
                        <div className="p-10 text-gray-900 h-full flex flex-col">
                            <div className="space-y-6">
                                {/* Experience (Part 2) */}
                                <div>
                                    {/* <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Experience (Cont.)</h2> */}
                                    <div className="space-y-5">
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Infogain India Pvt. Ltd.</span>
                                                <span>Noida, Uttar Pradesh</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Software Engineer</span>
                                                <span>Jan 2013 - Jun 2014</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Project: </span>Decision Point (a Mitchell Product) - Insurance</li>
                                                <li><span className="font-bold">Test Cases: </span>Creating scenario based automated test cases using Coded UI.</li>
                                                <li><span className="font-bold">Automation: </span>Automating manual test assets, automation code review, Test Impact Analysis.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Programming Skills */}
                                <div>
                                    <h2 className="text-base font-bold uppercase tracking-wide border-b border-gray-900 pb-1 mb-3 text-gray-900">Programming Skills</h2>
                                    <ul className="list-disc ml-5 space-y-2 text-sm text-gray-800">
                                        <li><span className="font-bold">Languages</span>: C#, Java, Javascript, SQL, Groovy</li>
                                        <li><span className="font-bold">Testing Tools</span>: CodedUI, MTM, TFS, Visual Studio, Selenium, SOAPUI, Google Cloud Console, JIRA, TestNG, QTest, MongoDB</li>
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
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Holy Child Auxilium</span>
                                                <span>Vasant Vihar, Delhi</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>AISSCE (10+2) ; Percentage: 73</span>
                                                <span>Apr. 2007 -- May. 2008</span>
                                            </div>
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
            const pageHeight = 1131;
            const gap = 32;
            const totalHeight = pageHeight * 2 + gap;

            return (
                <div
                    className="w-full flex flex-col items-center transition-all duration-300 origin-top"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * totalHeight}px`
                    }}
                >
                    {/* Page 1 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Lato", "Inter", sans-serif' }}
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

                            {/* Executive Content Page 1 */}
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
                            </div>
                        </div>
                    </div>

                    {/* Gap */}
                    <div className="h-8 w-full shrink-0" />

                    {/* Page 2 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Lato", "Inter", sans-serif' }}
                    >
                        <div className="p-12 text-gray-900 h-full flex flex-col">
                            <div className="space-y-6">
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
                </div>
            );
        }

        if (template.id === 'tech') {
            const pageHeight = 1131;
            const gap = 32;
            const totalHeight = pageHeight * 2 + gap;

            return (
                <div
                    className="w-full flex flex-col items-center transition-all duration-300 origin-top"
                    style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${(1 - scale) * totalHeight}px`
                    }}
                >
                    {/* Page 1 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Charter", "Bitstream Charter", "Georgia", serif' }}
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

                            {/* Tech Content Page 1 */}
                            <div className="space-y-5">
                                {/* Professional Summary */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Professional Summary</h2>
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        Results-driven <span className="font-bold">AI Solutions Engineer</span> with hands-on experience building production-grade AI systems, cloud integrations, and automation workflows. Adept at translating business requirements into scalable technical solutions across SaaS, fintech, and enterprise platforms. Strong background in Python, API development, and cross-team collaboration within fast-paced startup environments.
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
                                            <div className="text-gray-700">Focus: Software Engineering, Databases, Web Technologies, Operating Systems</div>
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
                                        <div><span className="font-bold">Tools:</span> GitHub, Jira, Confluence, Postman, Figma</div>
                                        <div><span className="font-bold">Soft Skills:</span> Technical Communication, Client Enablement, Solution Architecture, Documentation</div>
                                    </div>
                                </div>

                                {/* Experience (Part 1) */}
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
                                                <li>Collaborated with product and customer success teams to ensure smooth deployments.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gap */}
                    <div className="h-8 w-full shrink-0" />

                    {/* Page 2 */}
                    <div
                        className="w-full max-w-[800px] bg-white dark:bg-white shadow-2xl overflow-hidden relative"
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Charter", "Bitstream Charter", "Georgia", serif' }}
                    >
                        <div className="p-10 text-gray-900 h-full flex flex-col">
                            <div className="space-y-5">
                                {/* Experience (Part 2) */}
                                <div>
                                    {/* Continuing Experience Section Header visually distinct if needed, or just continue content */}
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Integration Engineer — SampleCloud Technologies (Remote)</span>
                                                <span>Jun 2023 – Dec 2023</span>
                                            </div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Built data integration pipelines across multi-cloud environments.</li>
                                                <li>Automated onboarding workflows, reducing setup time for new clients.</li>
                                                <li>Monitored and optimized system reliability across production environments.</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Software Engineer — DemoSoft Solutions (Hybrid)</span>
                                                <span>Aug 2021 – May 2023</span>
                                            </div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Developed scalable backend services supporting high-volume user traffic.</li>
                                                <li>Integrated analytics and reporting dashboards for business stakeholders.</li>
                                                <li>Collaborated with cross-functional teams on secure cloud deployments.</li>
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
                                                <li>Implemented intent classification and workflow routing logic.</li>
                                                <li>Deployed containerized services using Docker and cloud-native tooling.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">Cloud Data Integrator — Integration Framework</div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Designed a reusable framework for syncing enterprise data systems.</li>
                                                <li>Automated ETL pipelines using Python microservices.</li>
                                                <li>Built monitoring dashboards for data validation and observability.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">AI Demo Toolkit — Internal Enablement Tool</div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Created a toolkit for rapidly deploying customized AI demos.</li>
                                                <li>Integrated CRM and ticketing systems for end-to-end workflows.</li>
                                                <li>Enabled configurable deployments within minutes for sales engineers.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                {/* Certificates */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Certificates</h2>
                                    <div className="text-sm text-gray-800">
                                        <ul className="list-disc ml-5 mt-1 space-y-1">
                                            <li>AWS Certified Solutions Architect</li>
                                            <li>Machine Learning Specialization</li>
                                            <li>API Design and Integration</li>
                                            <li>Advanced Python Programming</li>
                                            <li>Cloud Engineering Fundamentals</li>
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
