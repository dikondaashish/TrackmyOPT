"use client";

import { motion } from "framer-motion";
import { CanonicalURL } from "@/components/CanonicalURL";
import Link from "next/link";
import {
    Users,
    MessageSquare,
    Globe,
    Award,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Search,
    UserCheck,
    HeartHandshake,
    Lightbulb
} from "lucide-react";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { MentorshipMap } from "@/components/features/MentorshipMap";
import { DiscussionThreadPreview } from "@/components/features/DiscussionThreadPreview";
import { H2, Lead, P } from "@/components/ui/typography";

export default function CommunityPage() {
    return (
        <>
            <CanonicalURL url="https://www.trackmyopt.com/features/community" />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <FeatureServiceSchema
                name="Alumni Mentorship & Community Network"
                description="Connect with verified alumni mentors from your university working at top companies. Get referrals, interview prep, and visa advice from real people who've navigated OPT successfully."
                featurePath="/features/community"
                faqItems={[
                  {question: "Are mentors paid for their time?", answer: "No, our mentors are volunteers who want to pay it forward. However, we recognize top mentors with badges and exclusive networking events."},
                  {question: "Is the community only for CS majors?", answer: "Not at all! We have a growing community of students in Data Science, Business Analytics, UX Design, and Engineering disciplines."},
                  {question: "How do you verify alumni status?", answer: "We verify alumni status through LinkedIn integration and university email verification (.edu addresses) to ensure you're connecting with real people."},
                  {question: "Can I post anonymously?", answer: "Yes, you can choose to post anonymously in the discussion forums if you have sensitive questions about your visa status or offers."}
                ]}
            />
            {/* Hero */}
            <FeatureHero
                badge="Community"
                headline="You Don't Have to Navigate OPT Alone"
                subheadline="Join a thriving community of international students and alumni. Get referrals, interview tips, and visa advice from people who've been there."
                ctaText="Join the Community"
                ctaHref="/login?visual=community"
                secondaryCta={{
                    text: "Explore Discussions",
                    href: "#discussions"
                }}
                gradient="from-purple-500 to-fuchsia-600"
                visual={<MentorshipMap />}
            />

            {/* Mentorship Feature */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
                                <UserCheck className="w-4 h-4" />
                                Alumni Mentorship
                            </div>
                            <H2>Connect with Mentors Who Get It</H2>
                            <P>
                                Find alumni from your university who are now working at your dream companies.
                                Request referrals, mock interviews, or just a coffee chat.
                            </P>
                            <ul className="space-y-4">
                                {[
                                    "Filter mentors by company (Google, Amazon, etc.)",
                                    "Find alumni from your specific university",
                                    "Verified 'Visa Sponsored' status badge",
                                    "One-click intro request templates"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-zinc-800"
                        >
                            {/* Re-using visual but maybe scaled/contextualized */}
                            <MentorshipMap />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Discussions Feature */}
            <section id="discussions" className="py-24 bg-white/50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            <DiscussionThreadPreview />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-sm font-medium mb-4">
                                <MessageSquare className="w-4 h-4" />
                                Expert Discussions
                            </div>
                            <H2>Real Advice. No Noise.</H2>
                            <P>
                                Skip the generic Reddit threads. Get verified answers about CPT, OPT, and H-1B
                                from students and legal experts in our curated forums.
                            </P>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
                                    <Lightbulb className="w-6 h-6 text-amber-500 mb-2" />
                                    <h5 className="font-semibold text-gray-900 dark:text-white">Interview Tips</h5>
                                    <p className="text-xs text-gray-500 mt-1">Company-specific guides from recent hires.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700">
                                    <Globe className="w-6 h-6 text-blue-500 mb-2" />
                                    <h5 className="font-semibold text-gray-900 dark:text-white">Legal Updates</h5>
                                    <p className="text-xs text-gray-500 mt-1">Latest USCIS news explained simply.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Value Props / Why Matters */}
            <FeatureWhyMatters
                headline="Networking is Your #1 Visa Asset"
                description="80% of jobs are filled through referrals. For international students, a strong network isn't just nice to have—it's essential for survival."
                accentColor="purple"
                stats={[
                    { value: "4x", label: "Higher hire rate with referral", icon: <Award className="w-5 h-5" /> },
                    { value: "5000+", label: "Verified alumni mentors", icon: <Users className="w-5 h-5" /> },
                    { value: "24h", label: "Avg response time", icon: <MessageSquare className="w-5 h-5" /> },
                    { value: "100%", label: "Real student community", icon: <HeartHandshake className="w-5 h-5" /> },
                ]}
            />

            {/* Testimonial */}
            <FeatureTestimonial
                quote="I got my Microsoft referral through TrackMyOPT's alumni network. The mentor I connected with didn't just refer me, he mocked interviewed me twice."
                author={{
                    name: "Rahul Patel",
                    role: "SDE @ Microsoft",
                    university: "Northeastern Univ.",
                }}
                accentColor="purple"
            />

            {/* FAQ */}
            <FeatureFAQ
                title="Community FAQ"
                subtitle="How networking works on TrackMyOPT"
                accentColor="purple"
                items={[
                    {
                        question: "Are mentors paid for their time?",
                        answer: "No, our mentors are volunteers who want to pay it forward. However, we recognize top mentors with badges and exclusive networking events."
                    },
                    {
                        question: "Is the community only for CS majors?",
                        answer: "Not at all! We have a growing community of students in Data Science, Business Analytics, UX Design, and Engineering disciplines."
                    },
                    {
                        question: "How do you verify alumni status?",
                        answer: "We verify alumni status through LinkedIn integration and university email verification (.edu addresses) to ensure you're connecting with real people."
                    },
                    {
                        question: "Can I post anonymously?",
                        answer: "Yes, you can choose to post anonymously in the discussion forums if you have sensitive questions about your visa status or offers."
                    }
                ]}
            />

            {/* CTA */}
            <FeatureCTA
                headline="Build Your Support Network"
                subheadline="Don't apply alone. Join thousands of international students helping each other secure their American Dream."
                primaryCTA={{
                    text: "Join Community Free",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "Browse Mentors",
                    href: "/features/community",
                }}
                gradient="purple"
                icon={<Users className="w-12 h-12 text-white" />}
                badge="5000+ Active Members"
            />
        </main>
        </>
    );
}
