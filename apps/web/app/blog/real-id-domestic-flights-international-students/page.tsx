import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, AlertTriangle, IdCard, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";

export const metadata: Metadata = {
    title: "Can International Students Fly Domestically Without a Passport? | TrackMyOPT",
    description: "Learn the TSA rules for domestic flights in the US on an F-1 visa. Find out how to get a REAL ID and why you should never travel without your I-20.",
    keywords: ["Domestic flight F1 student", "REAL ID international student", "Fly without passport US", "TSA rules F1 visa", "OPT domestic travel"],
    openGraph: {
        title: "Domestic Travel on OPT: Passports, REAL ID, and TSA Rules",
        description: "Flying from New York to LA for a weekend trip? Learn what documents TSA and Border Patrol require international students to carry for domestic flights.",
        type: "article",
        url: "https://www.trackmyopt.com/blog/real-id-domestic-flights-international-students",
        images: [
            {
                url: "/blog/real-id-domestic-flights-international-students.png",
                width: 1200,
                height: 630,
                alt: "Domestic airline boarding pass with a REAL ID driver's license and an I-20 document",
            },
        ],
    },
    alternates: {
        canonical: "https://www.trackmyopt.com/blog/real-id-domestic-flights-international-students",
    }
};

export default function RealIdPage() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <BlogPostSchema
                title={metadata.title as string}
                description={metadata.description as string}
                publishedDate="2026-05-02"
                modifiedDate="2026-05-02"
                author="Vinay Kumar"
                canonicalUrl={metadata.alternates?.canonical as string}
            />

            <header className="mb-10 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-4">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Life in US</span>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">Travel</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
                    Can International Students Fly Domestically Without a Passport?
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Taking a weekend trip to Vegas or flying across the country for an OPT job interview? Learn exactly what documents TSA and Border Patrol expect you to carry.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 7 min read</span>
                    <span>•</span>
                    <span>Updated July 12, 2026</span>
                </div>
            </header>

            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-xl">
                <img
                    src="/blog/real-id-domestic-flights-international-students.png"
                    alt="Domestic airline boarding pass with a REAL ID driver's license and an I-20 document"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="lead text-xl text-gray-600 dark:text-gray-300 mb-8">
                    When flying internationally, the rules are obvious: bring your passport. But what about domestic flights? If you are an F-1 international student flying from Chicago to Miami, do you need to risk losing your passport at the beach, or can you just use a US driver's license? The answer depends entirely on the upcoming <strong>REAL ID deadline</strong> and your immigration status.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">What is the REAL ID Act?</h2>
                <p>
                    Passed by Congress after 9/11, the REAL ID Act establishes minimum security standards for state-issued driver's licenses. Starting on <strong>May 7, 2025</strong>, every traveler aged 18 or older will need a REAL ID-compliant driver's license (or another acceptable form of ID, like a passport) to pass through TSA security checkpoints for domestic flights.
                </p>
                <p>
                    You can tell if your driver's license is REAL ID-compliant by looking for a <strong>gold or black star</strong> in the top right corner.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-6">Can F-1 Students Get a REAL ID?</h2>
                <p>
                    <strong>Yes.</strong> As an international student on an F-1 visa (including OPT and STEM OPT), you are in a period of "lawful status" in the United States. Therefore, you are legally entitled to receive a REAL ID-compliant driver's license from your state DMV.
                </p>
                <p>
                    However, getting one requires bringing a stack of immigration paperwork to the DMV, including:
                </p>
                <ul>
                    <li>Your unexpired foreign passport.</li>
                    <li>Your most recent I-94 Arrival/Departure record.</li>
                    <li>Your current I-20 (or EAD card if on OPT).</li>
                    <li>Proof of your Social Security Number (or a letter from the SSA stating you are ineligible).</li>
                    <li>Two proofs of physical residency (e.g., a utility bill and a bank statement).</li>
                </ul>

                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm my-8">
                    <h4 className="flex items-center gap-2 font-bold text-lg mt-0 mb-3"><IdCard className="w-5 h-5 text-blue-500" /> The "Limited Term" Caveat</h4>
                    <p className="mb-0 text-sm text-gray-600 dark:text-gray-400">
                        Because you are not a US citizen or Permanent Resident, your REAL ID will be marked as "Limited Term." This simply means the license will expire on the exact date your I-20 or EAD card expires. If you get a STEM OPT extension, you will have to go back to the DMV to extend your driver's license.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The TSA Checkpoint vs. Border Patrol</h2>
                <p>
                    If you have a REAL ID, you can use it to pass through the TSA security checkpoint to board your domestic flight. <strong>TSA agents are not immigration officers.</strong> Their job is to verify your identity and ensure aviation security, not to check your visa status.
                </p>
                <p>
                    <strong>HOWEVER:</strong> US Customs and Border Protection (CBP) operates internal checkpoints within 100 miles of any US land or coastal border. Furthermore, CBP occasionally conducts random immigration sweeps at domestic airport terminals. 
                </p>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl my-8">
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mt-0 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        The Legal Requirement to Carry Documents
                    </h3>
                    <p className="mb-0 text-red-800 dark:text-red-200">
                        Under INA Section 264(e), every foreign national 18 years and older must carry their "registration documents" (I-94, Passport, and I-20/EAD) with them <strong>at all times</strong>. If you are stopped by a CBP officer or local police and you only have a US driver's license, they have the legal authority to detain you until they can verify your lawful status.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">The TrackMyOPT Recommendation</h2>
                <p>
                    Should you carry your original passport, I-20, and EAD card every time you fly from New York to Florida? 
                </p>
                <p>
                    While the law says yes, many students are terrified of losing their passport on the beach. Here is the safest practical compromise:
                </p>
                <ol>
                    <li>Use your <strong>REAL ID driver's license</strong> to quickly get through TSA security.</li>
                    <li>Always carry your physical <strong>EAD card</strong> (if on OPT) or a physical copy of your most recent <strong>I-20</strong> in your backpack.</li>
                    <li>Use <strong>TrackMyOPT's Document Safe</strong>.</li>
                </ol>

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl my-8">
                    <h4 className="flex items-center gap-2 font-bold text-primary mt-0 mb-3">
                        <ShieldCheck className="w-6 h-6" /> The TrackMyOPT Document Safe
                    </h4>
                    <p className="mb-0">
                        If you are stopped by law enforcement or CBP and don't have your physical passport, having instant access to high-quality digital copies is your best defense against detention. 
                        By uploading your Passport, Visa stamp, I-94, I-20s, and EAD card to the <strong>TrackMyOPT Document Safe</strong>, you can instantly pull up your encrypted immigration file on your phone anywhere in the country.
                    </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-6">Special Domestic Travel Zones</h2>
                <p>
                    There are certain domestic flights where carrying your physical passport and valid I-20 is <strong>absolutely mandatory</strong>, even if you are just flying within the US:
                </p>
                <ul>
                    <li><strong>Puerto Rico and US Virgin Islands:</strong> While these are US territories and flights are considered domestic, CBP heavily patrols the airports. You will likely be asked to prove your immigration status before boarding your return flight to the mainland US.</li>
                    <li><strong>Hawaii and Alaska:</strong> If your flight is diverted and forced to land in Canada or Mexico, you will need your passport to re-enter the US.</li>
                </ul>

            </div>

            <hr className="my-12 border-gray-200 dark:border-zinc-800" />

            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-zinc-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Travel With Peace of Mind
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Never panic at an airport again. With TrackMyOPT, you can securely store digital backups of every immigration document you own. Plus, our system automatically tracks your SEVIS reporting deadlines so you never accidentally fall out of status while on vacation.
                </p>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                        Access the Document Safe
                    </Link>
                </div>
            </div>

            <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Resources</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Link href="/blog/travel-on-opt-documents-checklist" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                International Travel Checklist
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Leaving the US? Here is the exact checklist of physical documents you need to return safely.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                    <Link href="/blog/renewing-f1-visa-on-opt" className="group block h-full">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                Visa Renewal on OPT
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                Thinking of renewing your expired visa while on vacation? Read about the 214(b) denial risks first.
                            </p>
                            <span className="text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Guide <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </article>
    );
}
