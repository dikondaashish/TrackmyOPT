"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Building2, GraduationCap, Briefcase } from "lucide-react";

type ProgramType = "dso" | "ambassador" | "career";

export function ContactPartnership() {
    const [programType, setProgramType] = useState<ProgramType>("dso");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        university: "",
        role: "",
        studentCount: "",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const programOptions = [
        { id: "dso" as const, label: "DSO Partnership", icon: Building2 },
        { id: "ambassador" as const, label: "Campus Ambassador", icon: GraduationCap },
        { id: "career" as const, label: "Career Services", icon: Briefcase },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <section id="contact" className="py-16 bg-white dark:bg-zinc-950">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-border"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Thank You!
                        </h3>
                        <p className="text-muted-foreground">
                            We've received your inquiry and will be in touch within 1-2 business days.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="contact" className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Get in Touch
                    </h2>
                    <p className="text-muted-foreground">
                        Tell us about your institution and how we can help
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onSubmit={handleSubmit}
                    className="p-6 lg:p-8 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-border"
                >
                    {/* Program Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                            I'm interested in:
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {programOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setProgramType(option.id)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${programType === option.id
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border-border hover:border-primary/50"
                                        }`}
                                >
                                    <option.icon className="w-5 h-5" />
                                    <span className="text-xs text-center">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="your@university.edu"
                                required
                            />
                        </div>
                    </div>

                    {/* University & Role */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                University
                            </label>
                            <input
                                type="text"
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="University name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Your Role
                            </label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="e.g., DSO, Student, Advisor"
                                required
                            />
                        </div>
                    </div>

                    {/* Student Count (for DSO) */}
                    {programType === "dso" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Approximate F-1 Student Count
                            </label>
                            <select
                                value={formData.studentCount}
                                onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">Select range</option>
                                <option value="<500">Less than 500</option>
                                <option value="500-1000">500 - 1,000</option>
                                <option value="1000-2500">1,000 - 2,500</option>
                                <option value="2500-5000">2,500 - 5,000</option>
                                <option value="5000+">5,000+</option>
                            </select>
                        </div>
                    )}

                    {/* Message */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Message (Optional)
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            placeholder="Tell us more about your needs..."
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                        Submit Inquiry
                    </button>
                </motion.form>
            </div>
        </section>
    );
}
