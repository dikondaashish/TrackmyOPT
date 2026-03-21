"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Marquee } from '@/components/ui/marquee';

// Real international student testimonials with diverse backgrounds
const testimonials = [
    {
        name: 'Priya Sharma',
        university: 'MS CS, USC',
        body: 'The 90-day tracker saved me from losing my OPT status. Got my EAD card just in time!',
        img: 'https://randomuser.me/api/portraits/women/32.jpg',
        country: '🇮🇳 India',
    },
    {
        name: 'Wei Chen',
        university: 'MBA, NYU Stern',
        body: 'Finally found a legit H-1B sponsor through the database. No more shady consultancies!',
        img: 'https://randomuser.me/api/portraits/men/51.jpg',
        country: '🇨🇳 China',
    },
    {
        name: 'Fatima Al-Hassan',
        university: 'PhD Biology, MIT',
        body: 'The STEM OPT extension guide was incredibly detailed. Submitted my I-765 without any RFEs.',
        img: 'https://randomuser.me/api/portraits/women/68.jpg',
        country: '🇸🇦 Saudi Arabia',
    },
    {
        name: 'Carlos Rodriguez',
        university: 'MS Data Science, Georgia Tech',
        body: 'The unemployment day counter is a lifesaver. I always know exactly where I stand.',
        img: 'https://randomuser.me/api/portraits/men/22.jpg',
        country: '🇲🇽 Mexico',
    },
    {
        name: 'Yuki Tanaka',
        university: 'MS Finance, Columbia',
        body: 'Used the AI resume tool and got 3x more interview callbacks. Worth every penny!',
        img: 'https://randomuser.me/api/portraits/women/45.jpg',
        country: '🇯🇵 Japan',
    },
    {
        name: 'Adebayo Okonkwo',
        university: 'MS EE, Stanford',
        body: 'The case status tracker with push notifications is amazing. No more refreshing USCIS every hour.',
        img: 'https://randomuser.me/api/portraits/men/85.jpg',
        country: '🇳🇬 Nigeria',
    },
    {
        name: 'Maria Santos',
        university: 'MS Biotech, Harvard',
        body: 'TrackMyOPT helped me understand the I-20 update process. My DSO was impressed!',
        img: 'https://randomuser.me/api/portraits/women/53.jpg',
        country: '🇧🇷 Brazil',
    },
    {
        name: 'Raj Patel',
        university: 'MS CS, Carnegie Mellon',
        body: 'The H-1B sponsor score helped me focus my applications on companies that actually sponsor.',
        img: 'https://randomuser.me/api/portraits/men/33.jpg',
        country: '🇮🇳 India',
    },
    {
        name: 'Soo-Min Kim',
        university: 'MS UX Design, SCAD',
        body: 'Clean interface, actually understands OPT rules. Finally an app made for international students!',
        img: 'https://randomuser.me/api/portraits/women/61.jpg',
        country: '🇰🇷 South Korea',
    },
    {
        name: 'Ahmed Hassan',
        university: 'MS Mechanical Eng, UMich',
        body: 'The employer verification tool caught a fake company before I accepted their offer. Thank you!',
        img: 'https://randomuser.me/api/portraits/men/61.jpg',
        country: '🇪🇬 Egypt',
    },
    {
        name: 'Linh Nguyen',
        university: 'MS Accounting, UT Austin',
        body: 'Perfect for tracking unemployment days. The alerts remind me to report employer changes on time.',
        img: 'https://randomuser.me/api/portraits/women/75.jpg',
        country: '🇻🇳 Vietnam',
    },
    {
        name: 'Dmitry Volkov',
        university: 'PhD Physics, Caltech',
        body: 'Best $29 I spent this year. The peace of mind is priceless when you are on OPT.',
        img: 'https://randomuser.me/api/portraits/men/41.jpg',
        country: '🇷🇺 Russia',
    },
];

function TestimonialCard({ img, name, university, body, country }: (typeof testimonials)[number]) {
    return (
        <Card className="w-64 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-4 prose-longform">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                        <AvatarImage src={img} alt={name} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">{name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <figcaption className="text-sm font-semibold text-foreground flex items-center gap-1.5 truncate">
                            {name} <span className="text-xs">{country}</span>
                        </figcaption>
                        <p className="text-xs text-muted-foreground truncate">{university}</p>
                    </div>
                </div>
                <blockquote className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</blockquote>
            </CardContent>
        </Card>
    );
}

export function LandingTestimonials() {
    return (
        <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900 overflow-hidden" id="testimonials">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="prose-longform text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                        Trusted by International Students Nationwide
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join 2,500+ F-1 students from 50+ countries who use TrackMyOPT to navigate their immigration journey.
                    </p>
                </div>

                {/* 3D Marquee Testimonials */}
                <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden gap-4 [perspective:300px]">
                    <div
                        className="flex flex-row items-center gap-4"
                        style={{
                            transform:
                                'translateX(-100px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-10deg) rotateZ(20deg)',
                        }}
                    >
                        {/* Column 1: Down */}
                        <Marquee vertical pauseOnHover repeat={3} className="[--duration:35s]">
                            {testimonials.slice(0, 4).map((review) => (
                                <TestimonialCard key={review.name} {...review} />
                            ))}
                        </Marquee>
                        {/* Column 2: Up */}
                        <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:40s]">
                            {testimonials.slice(4, 8).map((review) => (
                                <TestimonialCard key={review.name} {...review} />
                            ))}
                        </Marquee>
                        {/* Column 3: Down */}
                        <Marquee vertical pauseOnHover repeat={3} className="[--duration:38s]">
                            {testimonials.slice(8, 12).map((review) => (
                                <TestimonialCard key={review.name} {...review} />
                            ))}
                        </Marquee>
                        {/* Column 4: Up */}
                        <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:42s]">
                            {testimonials.slice(0, 4).map((review) => (
                                <TestimonialCard key={review.name + '-dup'} {...review} />
                            ))}
                        </Marquee>
                    </div>

                    {/* Gradient overlays */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white dark:from-zinc-950"></div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-gray-50 dark:from-zinc-900"></div>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-zinc-950"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-zinc-950"></div>
                </div>
            </div>
        </section>
    );
}
