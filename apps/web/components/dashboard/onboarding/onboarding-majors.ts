export const STEM_KEYWORDS = [
  "computer",
  "software",
  "engineering",
  "math",
  "science",
  "technology",
  "cyber",
  "data",
  "information",
  "analytics",
  "statistics",
  "physics",
  "chemistry",
  "biology",
  "robotics",
  "artificial intelligence",
  "ai",
  "quantitative",
  "quant",
  "actuarial",
  "biomedical",
  "bioengineering",
  "mechatronics",
  "automation",
  "econometrics",
  "informatics",
];

export const COMMON_MAJORS = [
  "Computer Science",
  "Software Engineering",
  "Computer Engineering",
  "Information Technology",
  "Information Systems",
  "Data Science",
  "Data Analytics",
  "Business Analytics",
  "Cybersecurity",
  "Artificial Intelligence",
  "Machine Learning",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Industrial Engineering",
  "Biomedical Engineering",
  "Aerospace Engineering",
  "Chemical Engineering",
  "Mathematics",
  "Applied Mathematics",
  "Statistics",
  "Physics",
  "Chemistry",
  "Biology",
  "Biotechnology",
  "Business Administration",
  "Finance",
  "Accounting",
  "Marketing",
  "Economics",
  "Psychology",
  "Nursing",
  "Communications",
  "Graphic Design",
  "Architecture",
];

export function checkStemEligibility(major: string): boolean {
  if (!major) return false;
  const lowerMajor = major.toLowerCase();
  return STEM_KEYWORDS.some((keyword) => lowerMajor.includes(keyword));
}

export function filterMajors(query: string): string[] {
  if (!query) return COMMON_MAJORS;
  const lower = query.toLowerCase();
  return COMMON_MAJORS.filter((m) => m.toLowerCase().includes(lower));
}
