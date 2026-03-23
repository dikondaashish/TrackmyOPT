"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, ZoomIn, ZoomOut, Maximize, TrendingUp, CheckCircle, HelpCircle, AlertCircle, FileText } from "lucide-react";
import Image from "next/image";
import { Template, TemplateColor } from "@/lib/documents/templates";

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
                            <div className="text-center mb-6">
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Alex Chen</h1>
                                <p className="text-[#3D5A80] font-medium text-lg mb-3">Senior AI Engineer</p>
                                <div className="flex justify-center flex-wrap items-center gap-x-4 text-xs text-gray-700">
                                    <span>(555) 123-4567</span>
                                    <span className="text-gray-300">|</span>
                                    <span>San Francisco, CA</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-[#3D5A80]">alex.chen@email.com</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-[#3D5A80]">linkedin.com/in/alexchen</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-[#3D5A80]">github.com/alexc</span>
                                </div>
                                <div className="h-[2px] w-full bg-[#3D5A80] mt-4" />
                            </div>

                            {/* Modern Content Page 1 */}
                            <div className="space-y-5 flex-1">
                                <div className="text-[10pt] leading-relaxed text-gray-800">
                                    <p>Results-oriented Senior AI Engineer with 6+ years of experience in developing scalable machine learning systems and large language models. Proven track record at OpenAI and Netflix in optimizing algorithms for performance and user engagement. Passionate about ethical AI and democratizing access to advanced technology.</p>
                                </div>
                                <div>
                                    <h2 className="text-[#3D5A80] text-lg font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] mb-2 flex items-center">Skills</h2>
                                    <div className="text-sm grid grid-cols-[100px_1fr] gap-y-1 gap-x-4">
                                        <span className="font-bold">Languages</span><span>Python, C++, SQL, TypeScript, Go</span>
                                        <span className="font-bold">ML/AI</span><span>PyTorch, TensorFlow, JAX, Hugging Face, LangChain, CUDA</span>
                                        <span className="font-bold">Infrastructure</span><span>Kubernetes, Docker, AWS (SageMaker, EC2), Google Cloud, Terraform</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-[#3D5A80] text-lg font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] mb-3 flex items-center">Technical Experience</h2>
                                    <div className="space-y-4">
                                        <div className="text-sm">
                                            <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base">Member of Technical Staff</h3><span className="text-gray-600 font-medium">Jan. 2023 – Present</span></div>
                                            <div className="italic text-gray-700 mb-1">OpenAI, San Francisco, CA</div>
                                            <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-500">
                                                <li>Contributed to the training and fine-tuning of GPT-4, improving reasoning capabilities by 15% on benchmark tasks.</li>
                                                <li>Designed and implemented a distributed reinforcement learning framework using Ray, reducing training time by 30%.</li>
                                                <li>Collaborated with safety teams to implement RLHF pathways, reducing harmful outputs by 40%.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base">Senior Data Scientist</h3><span className="text-gray-600 font-medium">Jun. 2020 – Dec. 2022</span></div>
                                            <div className="italic text-gray-700 mb-1">Netflix, Los Gatos, CA</div>
                                            <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-500">
                                                <li>Led the "Watch Next" algorithm overhaul, utilizing graph neural networks to increase user retention by 5%.</li>
                                                <li>Built a real-time personalization engine processing 100k+ requests per second with sub-100ms latency.</li>
                                                <li>Mentored 3 junior data scientists and established best practices for model versioning and A/B testing.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base">Data Scientist II</h3><span className="text-gray-600 font-medium">Aug. 2018 – May 2020</span></div>
                                            <div className="italic text-gray-700 mb-1">Uber, San Francisco, CA</div>
                                            <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-500">
                                                <li>Developed dynamic pricing models using XGBoost, resulting in a $50M annual revenue increase in key markets.</li>
                                                <li>Created a rider churn prediction model that identified at-risk users with 85% accuracy, enabling targeted retention campaigns.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-[#3D5A80] text-lg font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] mb-3 flex items-center">Education</h2>
                                    <div className="text-sm space-y-3">
                                        <div>
                                            <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base">Master of Science in Computer Science (AI Specialization)</h3><span className="text-gray-600 font-medium">May 2018</span></div>
                                            <div className="italic text-gray-700">Stanford University, Stanford, CA</div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-baseline mb-0.5"><h3 className="font-bold text-base">Bachelor of Science in Electrical Engineering</h3><span className="text-gray-600 font-medium">May 2016</span></div>
                                            <div className="italic text-gray-700">University of California, Berkeley, CA</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-[#3D5A80] text-lg font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] mb-3 flex items-center">Selected Projects</h2>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <div className="font-bold text-gray-900">Generative Art Tool (Personal)</div>
                                            <ul className="list-disc ml-4 mt-1 space-y-1 text-gray-800 marker:text-gray-500">
                                                <li>Built a web-based tool using Stable Diffusion API and React to allow users to generate professional assets.</li>
                                                <li>Open-sourced the code on GitHub, garnering 1.5k+ stars.</li>
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
                        style={{ minHeight: `${pageHeight}px`, fontFamily: '"Source Sans Pro", sans-serif' }}
                    >
                        <div className="p-10 text-gray-900 h-full flex flex-col">
                            {/* Modern Content Page 2 */}
                            <div className="space-y-5 flex-1">
                                {/* Content moved to Page 1 */}
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
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Harshibar</h1>
                                <p className="text-blue-600 font-medium text-lg mb-3">Software Engineer</p>
                                <div className="flex justify-center flex-wrap items-center gap-x-4 text-xs text-gray-700 font-sans">
                                    <span>555.555.5555</span>
                                    <span className="text-gray-300">|</span>
                                    <span>San Francisco, CA</span>
                                    <span className="text-gray-300">|</span>
                                    <span>hello@email.com</span>
                                    <span className="text-gray-300">|</span>
                                    <span>linkedin.com/in/harshibar</span>
                                    <span className="text-gray-300">|</span>
                                    <span>github.com/harshibar</span>
                                </div>
                                <div className="h-[2px] w-full bg-blue-600 mt-4" />
                            </div>

                            {/* Professional Content */}
                            <div className="space-y-6">
                                {/* Experience */}
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-900 pb-1 mb-3">EXPERIENCE</h2>
                                    <div className="space-y-4">
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>YouTube Creator</span>
                                                <span>Jan. 2021 – Present</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-1">
                                                <span>@harshibar</span>
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
                                                <span>Aug. 2018 – Sep. 2019</span>
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
                                                <span>May 2017 – Aug. 2017</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-1">
                                                <span>Software Engineering Intern</span>
                                                <span>Seattle, WA</span>
                                            </div>
                                            <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                                <li><strong>Worked on the Search Customer Experience Team</strong>; <strong>received a return offer</strong> for a full-time position</li>
                                                <li><strong>Shipped a new feature to 2M+ users</strong> to improve the search experience for movie series-related queries</li>
                                                <li>Built a back-end database service in Java and implemented a front-end UI to support future changes</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                {/* Projects Part 1 */}
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-900 pb-1 mb-3">PROJECTS</h2>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900 mb-1">
                                                <span>Hyku Consulting</span>
                                                <span>Sep. 2019 – Mar. 2021</span>
                                            </div>
                                            <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                                <li>Mentored 15 students towards acceptance at top US boarding schools; achieved <strong>100% success rate</strong></li>
                                                <li>Designed a <strong>collaborative learning ecosystem</strong> for students and parents with Trello, Miro, and Google Suite</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900 mb-1">
                                                <span>Minimal Icon Pack</span>
                                                <span>Sep. 2020 – Nov. 2020</span>
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
                                            <span>Sep. 2019 – May 2020</span>
                                        </div>
                                        <ul className="list-disc ml-4 space-y-1 text-gray-800 marker:text-gray-900 text-[0.9rem] leading-snug">
                                            <li>Built a Python script to automatically apply to jobs on Glassdoor using BeautifulSoup and Selenium</li>
                                            <li><strong>500 stars on GitHub</strong>; featured on Hackaday; made the front page of r/python and r/programming</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Education */}
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-900 pb-1 mb-3">EDUCATION</h2>
                                    <div className="text-sm">
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Wellesley College</span>
                                            <span>Aug. 2014 – May 2018</span>
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
                                    <h2 className="text-base font-bold text-gray-900 border-b-2 border-gray-900 pb-1 mb-3">SKILLS</h2>
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
                            {/* Creative Header */}
                            <div className="text-center mb-6">
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Harshibar</h1>
                                <p className="text-blue-600 font-medium text-lg mb-3">Software Engineer</p>
                                <div className="flex justify-center flex-wrap items-center gap-x-4 text-xs text-gray-700">
                                    <span>(555) 123-4567</span>
                                    <span className="text-gray-300">|</span>
                                    <span>San Francisco, CA</span>
                                    <span className="text-gray-300">|</span>
                                    <span>hello@email.com</span>
                                    <span className="text-gray-300">|</span>
                                    <span>linkedin.com/in/harshibar</span>
                                    <span className="text-gray-300">|</span>
                                    <span>github.com/harshibar</span>
                                </div>
                                <div className="h-[2px] w-full bg-blue-600 mt-4" />
                            </div>

                            {/* Creative Content Page 1 */}
                            <div className="space-y-6">

                                {/* Education */}
                                <div>
                                    <h2 className="text-lg font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Education</h2>
                                    <div className="space-y-4">
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Rhode Island School of Design (RISD)</span>
                                                <span>Aug. 2013 – May 2017</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>Bachelor of Fine Arts in Graphic Design; GPA: 3.9</span>
                                                <span>Providence, RI</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Experience (Part 1) */}
                                <div>
                                    <h2 className="text-lg font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Experience</h2>
                                    <div className="space-y-5">
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Airbnb</span>
                                                <span>Jan. 2021 – Present</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Senior Product Designer</span>
                                                <span>San Francisco, CA</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Host Success:</span> Led the redesign of the Host Dashboard, resulting in a 20% increase in host engagement and a 15% reduction in support tickets. Conducted extensive user research with 50+ hosts globally.</li>
                                                <li><span className="font-bold">Design System:</span> Core contributor to the 'Airwaves' design system. Standardized mobile components, reducing engineering implementation time by 40% across iOS and Android teams.</li>
                                                <li><span className="font-bold">Accessibility:</span> Spearheaded the accessibility initiative for the booking flow, achieving WCAG 2.1 AA compliance and improving the experience for millions of users.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Spotify</span>
                                                <span>Jun. 2018 – Dec. 2020</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Product Designer</span>
                                                <span>New York, NY</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Personalization:</span> Designed the "Daily Mix" visual experience, contributing to a 10% increase in daily active users for personalized playlists.</li>
                                                <li><span className="font-bold">Artist Tools:</span> collaborated with data scientists to visualize listener demographics for Spotify for Artists, helping 1M+ artists understand their audience.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>IDEO</span>
                                                <span>Jun. 2017 – May 2018</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Interaction Design Intern</span>
                                                <span>Boston, MA</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Future of Mobility:</span> Prototyped in-car digital interfaces for a major automotive client, focusing on trust and safety in autonomous vehicles.</li>
                                                <li><span className="font-bold">Design Thinking:</span> Facilitated workshops for Fortune 500 clients to identify user needs and generate innovative product concepts.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                {/* Projects */}
                                <div>
                                    <h2 className="text-lg font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Projects</h2>
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Design Systems Conference Talk</span>
                                                <span>2022</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li>Delivered a talk at Config 2022 titled "Scaling Empathy in Design Systems," viewed by 10k+ designers.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <h2 className="text-lg font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Skills</h2>
                                    <div className="text-sm text-gray-800 space-y-1">
                                        <div><span className="font-bold">Design:</span> UI/UX, Interaction Design, Visual Design, Prototyping, Wireframing</div>
                                        <div><span className="font-bold">Tools:</span> Figma, Protopie, Adobe CC (Ps, Ai, Ae), Sketch, Principle</div>
                                        <div><span className="font-bold">Code:</span> HTML/CSS, React (Basic), Storybook, Framer Motion</div>
                                        <div><span className="font-bold">Research:</span> Usability Testing, User Interviews, A/B Testing, Heuristic Analysis</div>
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
                            {/* Creative Content Page 2 */}
                            <div className="space-y-6">
                                {/* Experience (Part 2 - Empty now, removed) */}


                                {/* Projects (Moved to Page 1) */}


                                {/* Skills (Moved to Page 1) */}

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
                            <div className="text-center mb-6">
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1" style={{ fontFamily: '"Charter", serif' }}>Vidushi Wahal</h1>
                                <p className="text-blue-600 font-medium text-lg mb-3">Senior QA Engineer</p>
                                <div className="flex justify-center flex-wrap items-center gap-x-4 text-xs text-gray-700">
                                    <span>+91-9811405837</span>
                                    <span className="text-gray-300">|</span>
                                    <span>Gurgaon, Haryana</span>
                                    <span className="text-gray-300">|</span>
                                    <span>vidushi22@gmail.com</span>
                                    <span className="text-gray-300">|</span>
                                    <span>linkedin.com/in/vidushi-wahal</span>
                                    <span className="text-gray-300">|</span>
                                    <span>github.com/vidushi-wahal</span>
                                </div>
                                <div className="h-[2px] w-full bg-blue-600 mt-4" />
                            </div>

                            {/* Academic Content Page 1 */}
                            <div className="space-y-6">

                                {/* Professional Summary */}
                                <div>
                                    <h2 className="text-base font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Research Interests</h2>
                                    <ul className="list-disc ml-5 space-y-2 text-sm text-gray-800">
                                        <li>Quantum Computing, Distributed Systems, Cryptography, Algorithm Design.</li>
                                        <li>Focus on developing error-correction protocols for noisy intermediate-scale quantum (NISQ) devices.</li>
                                    </ul>
                                </div>

                                {/* Research Experience */}
                                <div>
                                    <h2 className="text-base font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Research Experience</h2>
                                    <div className="space-y-5">
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>MIT CSAIL</span>
                                                <span>Cambridge, MA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Postdoctoral Researcher</span>
                                                <span>Sep. 2023 – Present</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Quantum Algorithms: </span>Developing novel algorithms for quantum simulation of chemical systems, aiming to reduce gate count by 20%.</li>
                                                <li><span className="font-bold">Mentorship: </span>Supervising 2 PhD students and 3 undergraduates in the Quantum Information Science group.</li>
                                                <li><span className="font-bold">Collaboration: </span>Partnering with IBM Quantum to benchmark error mitigation strategies on 127-qubit processors.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Google Research</span>
                                                <span>Mountain View, CA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Research Intern</span>
                                                <span>Jun. 2022 – Aug. 2022</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Distributed Systems: </span>Investigated consistency models in geo-replicated databases, proposing a new hybrid clock synchronization protocol.</li>
                                                <li><span className="font-bold">Publication: </span>Co-authored a paper accepted at OSDI '23 based on internship findings.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Stanford University</span>
                                                <span>Stanford, CA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Graduate Research Assistant</span>
                                                <span>Sep. 2018 – Jun. 2023</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-2 text-gray-800">
                                                <li><span className="font-bold">Thesis: </span>"Optimizing Quantum Gates for Trapped-Ion Systems"</li>
                                                <li><span className="font-bold">Teaching: </span>Head TA for CS106B (Programming Abstractions), managing a team of 20 section leaders.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Publications */}
                                <div>
                                    <h2 className="text-base font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Selected Publications</h2>
                                    <ul className="list-disc ml-5 space-y-2 text-sm text-gray-800">
                                        <li><span className="font-bold">E. Rodriguez</span>, A. Smith, B. Jones. "Scalable Error Correction for NISQ Devices." <span className="italic">Nature Physics</span>, 2023.</li>
                                        <li><span className="font-bold">E. Rodriguez</span>, C. Lee. "Hybrid Clock Synchronization for Geo-Replicated Databases." <span className="italic">OSDI</span>, 2023.</li>
                                        <li>D. Chen, <span className="font-bold">E. Rodriguez</span>. "Quantum Simulation of Fermionic Systems." <span className="italic">Physical Review Letters</span>, 2021.</li>
                                    </ul>
                                </div>

                                {/* Technical Skills */}
                                <div>
                                    <h2 className="text-base font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Technical Skills</h2>
                                    <ul className="list-disc ml-5 space-y-2 text-sm text-gray-800">
                                        <li><span className="font-bold">Languages</span>: C++, Python, MATLAB, Julia, Haskell</li>
                                        <li><span className="font-bold">Quantum Tools</span>: Qiskit, Cirq, PennyLane, QuTiP</li>
                                        <li><span className="font-bold">Tools</span>: LaTeX, Git, Docker, Kubernetes, AWS</li>
                                    </ul>
                                </div>

                                {/* Education */}
                                <div>
                                    <h2 className="text-base font-bold uppercase tracking-wide border-b-[1.5px] border-[#3D5A80] pb-1 mb-3 text-gray-900">Education</h2>
                                    <div className="space-y-4">
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Stanford University</span>
                                                <span>Stanford, CA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>PhD in Computer Science; GPA: 4.0</span>
                                                <span>Sep. 2018 – Jun. 2023</span>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Massachusetts Institute of Technology (MIT)</span>
                                                <span>Cambridge, MA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>B.S. in Mathematics and Physics</span>
                                                <span>Sep. 2014 – Jun. 2018</span>
                                            </div>
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
                                {/* Experience (Part 2 - Moved to Page 1) */}


                                {/* Publications (Moved to Page 1) */}


                                {/* Programming Skills (Moved to Page 1) */}

                                {/* Education (Moved to Page 1) */}

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
                            <div className="text-center mb-6">
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">First Last</h1>
                                <p className="text-blue-600 font-medium text-lg mb-3">Executive Leader</p>
                                <div className="flex justify-center flex-wrap items-center gap-x-4 text-xs text-gray-700">
                                    <span>123-456-7890</span>
                                    <span className="text-gray-300">|</span>
                                    <span>Location</span>
                                    <span className="text-gray-300">|</span>
                                    <span>x@x.com</span>
                                    <span className="text-gray-300">|</span>
                                    <span>linkedin.com/in/firstlast</span>
                                    <span className="text-gray-300">|</span>
                                    <span>github.com/firstlast</span>
                                </div>
                                <div className="h-[2px] w-full bg-blue-600 mt-4" />
                            </div>

                            {/* Executive Content Page 1 */}
                            <div className="space-y-6">

                                {/* Executive Summary */}
                                <div>
                                    <h2 className="text-xl font-light uppercase tracking-widest border-b border-gray-900 pb-1 mb-4 text-gray-900">Executive Profile</h2>
                                    <p className="text-sm text-gray-800 leading-relaxed italic">
                                        Visionary Technology Executive with 15+ years of experience scaling engineering organizations from pre-seed to IPO. Proven track record in building high-performance teams, driving technical strategy, and delivering mission-critical systems at scale. Expertise in Cloud Architecture, AI/ML integration, and Enterprise Security.
                                    </p>
                                </div>

                                {/* Professional Experience */}
                                <div>
                                    <h2 className="text-xl font-light uppercase tracking-widest border-b-[1.5px] border-[#3D5A80] pb-1 mb-4 text-gray-900">Professional Experience</h2>
                                    <div className="space-y-6">
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                                <span>Stripe</span>
                                                <span>San Francisco, CA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>VP of Engineering, Payments Platform</span>
                                                <span>Mar. 2020 – Present</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-1.5 text-gray-800 leading-relaxed">
                                                <li>Lead a global engineering organization of 300+ engineers, product managers, and data scientists.</li>
                                                <li>Architected the next-generation global payments infrastructure, handling $500B+ annual volume with 99.999% availability.</li>
                                                <li>Spearheaded the integration of machine learning models for real-time fraud detection, reducing fraud losses by 40% year-over-year.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                                <span>Uber</span>
                                                <span>San Francisco, CA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Senior Director of Engineering, Infrastructure</span>
                                                <span>Jun. 2016 – Feb. 2020</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-1.5 text-gray-800 leading-relaxed">
                                                <li>Managed the core infrastructure teams (Compute, Storage, Network) supporting thousands of microservices.</li>
                                                <li>Reduced infrastructure costs by 30% ($50M+ annual savings) through strategic multi-cloud adoption and container orchestration optimization.</li>
                                            </ul>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                                <span>Google</span>
                                                <span>Mountain View, CA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700 mb-2">
                                                <span>Director of Engineering, Google Cloud</span>
                                                <span>Aug. 2012 – May. 2016</span>
                                            </div>
                                            <ul className="list-disc ml-5 space-y-1.5 text-gray-800 leading-relaxed">
                                                <li>Founded and led the Kubernetes Engine (GKE) team from inception to general availability.</li>
                                                <li>Grew the team from 5 to 80+ engineers and product managers.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                {/* Board Memberships & Advisory */}
                                <div>
                                    <h2 className="text-xl font-light uppercase tracking-widest border-b-[1.5px] border-[#3D5A80] pb-1 mb-4 text-gray-900">Board Memberships & Advisory</h2>
                                    <div className="space-y-2 text-sm text-gray-800">
                                        <div><span className="font-bold">Board Member: </span>TechStart Ups (Series B Fintech), 2021 – Present</div>
                                        <div><span className="font-bold">Technical Advisor: </span>AI Ventures (Seed Stage VC Fund), 2022 – Present</div>
                                    </div>
                                </div>

                                {/* Strategic & Technical Skills */}
                                <div>
                                    <h2 className="text-xl font-light uppercase tracking-widest border-b-[1.5px] border-[#3D5A80] pb-1 mb-4 text-gray-900">Strategic & Technical Skills</h2>
                                    <div className="text-sm text-gray-800 space-y-1">
                                        <div><span className="font-bold">Leadership:</span> Organizational Design, Strategic Planning, M&A Technical Due Diligence, Executive Hiring</div>
                                        <div><span className="font-bold">Technical:</span> Distributed Systems, Cloud Native Architecture (Kubernetes), AI/ML Platforms, Fintech/Payments</div>
                                    </div>
                                </div>
                                {/* Education */}
                                <div>
                                    <h2 className="text-xl font-light uppercase tracking-widest border-b-[1.5px] border-[#3D5A80] pb-1 mb-4 text-gray-900">Education</h2>
                                    <div className="text-sm">
                                        <div className="mb-4 last:mb-0">
                                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                                <span>Harvard Business School</span>
                                                <span>Cambridge, MA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>Master of Business Administration (MBA)</span>
                                                <span>Sep. 2008 – May 2010</span>
                                            </div>
                                        </div>
                                        <div className="mb-4 last:mb-0">
                                            <div className="flex justify-between font-bold text-gray-900 text-base">
                                                <span>Yale University</span>
                                                <span>New Haven, CT</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>Bachelor of Arts in Economics</span>
                                                <span>Sep. 2004 – May 2008</span>
                                            </div>
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
                                {/* Projects (Moved to Page 1 Experience) */}


                                {/* Board Memberships (Moved to Page 1) */}


                                {/* Skills (Moved to Page 1) */}

                                {/* Education (Moved to Page 1) */}

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
                        <div className="p-12 text-gray-900 h-full flex flex-col">
                            {/* Tech Header */}
                            <div className="text-center mb-4">
                                <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-2">John Doe</h1>
                                <p className="text-[#3D5A80] font-medium text-xl mb-3">AI Solutions Engineer</p>
                                <div className="flex justify-center flex-wrap items-center gap-x-4 text-[0.85rem] text-gray-800">
                                    <span>555-123-4567</span>
                                    <span className="text-gray-300">|</span>
                                    <span>Boston, Massachusetts</span>
                                    <span className="text-gray-300">|</span>
                                    <span>johndoe@example.com</span>
                                    <span className="text-gray-300">|</span>
                                    <span>linkedin.com/in/john-doe</span>
                                    <span className="text-gray-300">|</span>
                                    <span>github.com/john-doe</span>
                                </div>
                                <div className="h-[2px] w-full bg-[#3D5A80] mt-4" />
                            </div>

                            {/* Tech Content Page 1 */}
                            <div className="space-y-4">
                                {/* Professional Summary */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Professional Summary</h2>
                                    <p className="text-[0.9rem] text-gray-800 leading-snug">
                                        Results-driven <span className="font-bold">AI Solutions Engineer</span> with hands-on experience building production-grade AI systems, cloud integrations, and automation workflows. Adept at translating business requirements into scalable technical solutions across SaaS, fintech, and enterprise platforms. Strong background in Python, API development, and cross-team collaboration within fast-paced startup environments.
                                    </p>
                                </div>

                                {/* Education */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Education</h2>
                                    <div className="space-y-2 text-[0.9rem]">
                                        <div className="flex justify-between font-bold text-gray-900">
                                            <span>Example University — Master’s in Computer Science</span>
                                            <span>Aug. 2022 – May. 2024</span>
                                        </div>
                                        <p className="text-gray-800">Focus: Artificial Intelligence, Distributed Systems, Cloud Computing</p>

                                        <div className="flex justify-between font-bold text-gray-900 mt-2">
                                            <span>Sample Institute of Technology — Bachelor of Computer Applications</span>
                                            <span>Aug. 2018 – Jul. 2022</span>
                                        </div>
                                        <p className="text-gray-800">Focus: Software Engineering, Databases, Web Technologies, Operating Systems</p>
                                    </div>
                                </div>

                                {/* Technical Skills */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Technical Skills</h2>
                                    <div className="text-[0.9rem] text-gray-800 space-y-1">
                                        <p><strong>Languages:</strong> Python, JavaScript, Java, SQL, Go</p>
                                        <p><strong>AI/ML:</strong> LangChain, OpenAI API, TensorFlow, Scikit-learn</p>
                                        <p><strong>Cloud Platforms:</strong> AWS, GCP, Azure, Docker, Kubernetes</p>
                                        <p><strong>Integration:</strong> REST APIs, GraphQL, Webhooks, ETL Pipelines</p>
                                        <p><strong>Tools:</strong> GitHub, Jira, Confluence, Postman, Figma</p>
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Experience</h2>
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Senior DevOps Engineer — Amazon Web Services (AWS)</span>
                                                <span>Jul. 2021 – Present</span>
                                            </div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Architected a multi-region Kubernetes cluster handling 1M+ requests per second for high-traffic retail services.</li>
                                                <li>Implemented GitOps workflows using ArgoCD, reducing deployment errors by 90% and enabling 50+ daily deployments.</li>
                                                <li>Developed custom Terraform modules for standardizing infrastructure provisioning across 20+ engineering teams.</li>
                                                <li>Led the migration of legacy monolithic applications to microservices architecture, improving scalability and fault tolerance.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Integration Engineer — SampleCloud Technologies (Remote)</span>
                                                <span>Jun. 2023 – Dec. 2023</span>
                                            </div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Built data integration pipelines across multi-cloud environments.</li>
                                                <li>Automated onboarding workflows, reducing setup time for new clients.</li>
                                                <li>Monitored and optimized system reliability across production environments.</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>DevOps Engineer — Oracle Cloud Infrastructure</span>
                                                <span>Jun. 2018 – Jun. 2021</span>
                                            </div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Built and maintained CI/CD pipelines for 50+ microservices using Jenkins and Docker.</li>
                                                <li>Automated database backups and disaster recovery procedures, reducing RTO by 50%.</li>
                                                <li>Implemented centralized logging and monitoring using ELK Stack and Prometheus.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                {/* Projects (Moved from Page 2) */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Projects</h2>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <div className="font-bold text-gray-900">Serverless Image Processing Pipeline</div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Built a serverless architecture using AWS Lambda and S3 to process 10k+ images daily.</li>
                                                <li>Reduced processing costs by 60% compared to EC2-based solution.</li>
                                                <li>Implemented event-driven triggers for automated resizing and optimization.</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">Multi-Cloud Disaster Recovery Strategy</div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Designed a failover strategy across AWS and Azure using Terraform and DNS traffic management.</li>
                                                <li>Conducted successful DR drills to validate RPO/RTO objectives.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                {/* Education (Moved from Page 2) */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Education</h2>
                                    <div className="space-y-2 text-sm text-gray-800">
                                        <div className="mb-3">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>University of Washington</span>
                                                <span>Seattle, WA</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>M.S. in Computer Science</span>
                                                <span>Sep. 2014 – May. 2016</span>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex justify-between font-bold text-gray-900">
                                                <span>Purdue University</span>
                                                <span>West Lafayette, IN</span>
                                            </div>
                                            <div className="flex justify-between italic text-gray-700">
                                                <span>B.S. in Electrical and Computer Engineering</span>
                                                <span>Sep. 2010 – May. 2014</span>
                                            </div>
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
                                                <span>Systems Administrator — IBM</span>
                                                <span>Aug. 2016 – May. 2018</span>
                                            </div>
                                            <ul className="list-disc ml-5 mt-1 space-y-1 text-gray-800">
                                                <li>Managed 500+ Linux servers, ensuring 99.9% uptime and security compliance.</li>
                                                <li>Automated routine administrative tasks using Bash and Python scripts.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Projects (Moved to Page 1) */}

                                {/* Certificates */}
                                <div>
                                    <h2 className="text-lg font-bold border-b border-gray-900 pb-1 mb-2 text-gray-900">Certifications</h2>
                                    <div className="text-sm text-gray-800">
                                        <ul className="list-disc ml-5 mt-1 space-y-1">
                                            <li>AWS Certified DevOps Engineer – Professional</li>
                                            <li>Certified Kubernetes Administrator (CKA)</li>
                                            <li>HashiCorp Certified: Terraform Associate</li>
                                            <li>Google Professional Cloud Architect</li>
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
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-blue-600 rounded-full p-1">
                                        <TrendingUp className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        Recent Success
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    Using this template cracked <span className="font-bold text-gray-900 dark:text-white">
                                        {template.id === 'modern' && 'OpenAI'}
                                        {template.id === 'professional' && 'Google'}
                                        {template.id === 'creative' && 'Airbnb'}
                                        {template.id === 'academic' && 'Stanford University'}
                                        {template.id === 'executive' && 'Meta'}
                                        {template.id === 'tech' && 'AWS'}
                                    </span> ATS in recent time.
                                </p>
                                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400 font-medium">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified ATS-Compatible
                                </div>
                            </div>
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
                            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-blue-500/20"
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
