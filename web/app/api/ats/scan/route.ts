
// @ts-ignore
const pdf = require('pdf-parse');
import mammoth from 'mammoth';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const resumeFile = formData.get('resumeFile') as File | null;
        const resumeTextRaw = formData.get('resumeText') as string | null;
        const jobDescription = formData.get('jobDescription') as string | null;

        if (!jobDescription) {
            return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
        }

        let resumeText = resumeTextRaw || '';

        // Handle File Upload if provided
        if (resumeFile) {
            const arrayBuffer = await resumeFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (resumeFile.type === 'application/pdf') {
                const data = await pdf(buffer);
                resumeText = data.text;
            } else if (
                resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                resumeFile.name.endsWith('.docx')
            ) {
                const result = await mammoth.extractRawText({ buffer });
                resumeText = result.value;
            } else {
                // Fallback for text files
                resumeText = buffer.toString('utf-8');
            }
        }

        if (!resumeText.trim()) {
            return NextResponse.json({ error: 'Could not extract text from resume' }, { status: 400 });
        }

        // --- SCORING LOGIC ---
        // 1. Keyword Matching
        // Extract keywords from Job Description (simple extraction of nouns/skills)
        // For now, we will use a predefined list of common tech/industry keywords to look for in both.

        const commonKeywords = [
            'javascript', 'python', 'react', 'node.js', 'java', 'sql', 'aws', 'docker', 'kubernetes', 'typescript',
            'project management', 'agile', 'scrum', 'sales', 'marketing', 'leadership', 'communication',
            'analysis', 'data', 'design', 'html', 'css', 'git', 'ci/cd', 'testing', 'automation'
        ];

        // Simple keyword extraction from JD (words > 4 chars, common tech terms)
        const jdWords = jobDescription.toLowerCase().match(/\b\w+\b/g) || [];
        const importantJdKeywords = [...new Set(jdWords.filter(w =>
            w.length > 4 || commonKeywords.includes(w)
        ))];

        const resumeType = resumeText.toLowerCase();
        const matchedKeywords = importantJdKeywords.filter(keyword => resumeType.includes(keyword));
        const missingKeywords = importantJdKeywords.filter(keyword => !resumeType.includes(keyword));

        // 2. Formatting Checks
        const hasEmail = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/.test(resumeText);
        const hasPhone = /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/.test(resumeText);
        const wordCount = resumeText.split(/\s+/).length;

        // 3. Calculate Score
        // Weighted scoring: Keywords (60%), Formatting (20%), Length (20%)
        const keywordMatchRate = matchedKeywords.length / (importantJdKeywords.length || 1);
        const keywordScore = Math.min(100, Math.round(keywordMatchRate * 100));

        let formatScore = 0;
        if (hasEmail) formatScore += 50;
        if (hasPhone) formatScore += 50;

        let lengthScore = 0;
        if (wordCount > 200 && wordCount < 2000) lengthScore = 100;
        else if (wordCount > 0) lengthScore = 50;

        const overallScore = Math.round(
            (keywordScore * 0.6) + (formatScore * 0.2) + (lengthScore * 0.2)
        );

        // Mock "Recruiter Psychology" (to match UI expectation)
        const mockPsychology = {
            impression: overallScore > 80 ? 'Highly Impressive' : overallScore > 50 ? 'Good' : 'Needs Improvement',
            summary: overallScore > 80
                ? 'Your resume strongly matches the job description. Recruiters will likely see you as a strong fit.'
                : 'There are some gaps between your resume and the job description. detailed tailoring is recommended.'
        };

        return NextResponse.json({
            success: true,
            scanId: Math.random().toString(36).substring(7), // Mock ID
            score: overallScore,
            analysis: {
                keywords: {
                    matched: matchedKeywords.slice(0, 20), // Limit for UI
                    missing: missingKeywords.slice(0, 20)
                },
                formatting: {
                    hasEmail,
                    hasPhone,
                    wordCount
                },
                psychology: mockPsychology
            },
            text: resumeText.substring(0, 500) + '...' // Preview
        });

    } catch (error) {
        console.error('ATS Scan Error:', error);
        return NextResponse.json({ error: 'Internal Server Error during scan' }, { status: 500 });
    }
}
