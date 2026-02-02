"use client";

import { motion } from "framer-motion";
import { Linkedin, Twitter, Github } from "lucide-react";
import { useState } from "react";

interface TeamMember {
    name: string;
    role: string;
    background: string;
    funFact: string;
    image?: string;
    social?: {
        linkedin?: string;
        twitter?: string;
        github?: string;
    };
}

const teamMembers: TeamMember[] = [
    {
        name: "Ashish Dikonda",
        role: "Founder & CEO",
        background: "Former F-1 student from India. MS in Computer Science. Experienced the OPT struggle firsthand.",
        funFact: "Can solve a Rubik's cube in under 2 minutes",
        social: { linkedin: "#", twitter: "#", github: "#" },
    },
    {
        name: "Sarah Chen",
        role: "Head of Product",
        background: "Former F-1 student from China. Product manager at big tech before joining.",
        funFact: "Speaks 4 languages fluently",
        social: { linkedin: "#" },
    },
    {
        name: "Rahul Patel",
        role: "Lead Engineer",
        background: "Former F-1 student from India. Full-stack developer with 8 years experience.",
        funFact: "Builds mechanical keyboards as a hobby",
        social: { linkedin: "#", github: "#" },
    },
    {
        name: "Maria Garcia",
        role: "Customer Success",
        background: "Former F-1 student from Mexico. Helped 500+ students navigate the OPT process.",
        funFact: "Former competitive salsa dancer",
        social: { linkedin: "#", twitter: "#" },
    },
    {
        name: "David Kim",
        role: "Data Analyst",
        background: "Former F-1 student from South Korea. Built the H-1B sponsor database.",
        funFact: "Collects vintage video games",
        social: { linkedin: "#" },
    },
    {
        name: "Priya Sharma",
        role: "Marketing Lead",
        background: "Former F-1 student from India. Expert in growth marketing for EdTech.",
        funFact: "Yoga instructor on weekends",
        social: { linkedin: "#", twitter: "#" },
    },
];

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative h-80 cursor-pointer perspective-1000"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front of card */}
                <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800 border border-gray-200 dark:border-zinc-700 p-6 flex flex-col items-center justify-center backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-3xl font-bold text-white">
                            {member.name.split(" ").map(n => n[0]).join("")}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                        {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {member.role}
                    </p>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        Hover to learn more
                    </p>
                </div>

                {/* Back of card */}
                <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex flex-col justify-between text-white backface-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div>
                        <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                        <p className="text-blue-200 font-medium mb-4">{member.role}</p>
                        <p className="text-sm text-blue-100 leading-relaxed mb-4">
                            {member.background}
                        </p>
                        <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                            <p className="text-xs text-blue-200 font-medium mb-1">Fun Fact</p>
                            <p className="text-sm">{member.funFact}</p>
                        </div>
                    </div>

                    {member.social && (
                        <div className="flex items-center gap-3 mt-4">
                            {member.social.linkedin && (
                                <a href={member.social.linkedin} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            )}
                            {member.social.twitter && (
                                <a href={member.social.twitter} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                    <Twitter className="w-4 h-4" />
                                </a>
                            )}
                            {member.social.github && (
                                <a href={member.social.github} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                    <Github className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

export function TeamSection() {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
                        Meet the Team
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Former F-1 Students Who Get It
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Our entire team has been through the international student journey. We built this because we needed it.
                    </p>
                </motion.div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers.map((member, index) => (
                        <TeamCard key={member.name} member={member} index={index} />
                    ))}
                </div>

                {/* Hiring CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="font-medium">We&apos;re hiring! Check out our open positions</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
