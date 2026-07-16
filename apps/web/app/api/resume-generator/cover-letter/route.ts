import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getUserId } from '@/lib/auth/getUserId';
import { GenerateCoverLetterRequestSchema } from '@/lib/resume/autofill-schema';
import { consumeAiGeneration } from '@/lib/ai-generation-limits';
export async function POST(req:NextRequest) {
  const userId=await getUserId(req); if(!userId)return NextResponse.json({error:'Unauthorized'},{status:401});
  const parsed=GenerateCoverLetterRequestSchema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:'Invalid request'},{status:400});
  const {snapshot,sourceContentHash,job}=parsed.data;
  const limit=consumeAiGeneration(userId,`${job.companyName}|${job.roleTitle}|${sourceContentHash}`,true);
  if(!limit.allowed)return NextResponse.json({error:limit.error,limits:limit},{status:429});
  const text=`Dear ${job.companyName} hiring team,\n\nI am excited to apply for the ${job.roleTitle} role. ${snapshot.summary||'My experience aligns with the needs described in the job posting.'}\n\nSincerely,\n${snapshot.contact.fullName||[snapshot.contact.firstName,snapshot.contact.lastName].filter(Boolean).join(' ')}`;
  const pdf=Buffer.from(`%PDF-1.4\n% TrackMyOPT cover letter\n${text}`).toString('base64');
  const hash=createHash('sha256').update(pdf,'base64').digest('hex');
  return NextResponse.json({attachment:{filename:'cover-letter.pdf',base64:pdf,sha256:hash,generatedAt:new Date().toISOString(),sourceContentHash},draftText:text,limits:limit});
}
