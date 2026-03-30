import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { contractText, clauseType } = await req.json();

    if (!contractText) {
      return NextResponse.json({ error: 'Contract text is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com/v1',
    });

    const prompt = `You are an expert contract attorney and risk analyst. Analyze the following contract clause or agreement excerpt for legal risks, unfair terms, and missing protections.

CONTRACT TYPE: ${clauseType}
CONTRACT TEXT:
---
${contractText}
---

For each contract, provide a comprehensive analysis in the following format:

## CLAUSE SUMMARY
[1-2 sentence plain-language summary of what this clause does]

## RISK FLAGS
Flag each identified risk with severity:
🔴 HIGH RISK — [description of the risk and why it is dangerous]
🟡 MEDIUM RISK — [description of the risk]
🟢 LOW RISK — [minor concern or best-practice improvement]

## SPECIFIC ISSUES FOUND
For each issue:
- **Issue:** [specific problematic language or omission]
- **Risk:** [what could go wrong]
- **Recommendation:** [how to fix or negotiate this term]
- **Negotiating Leverage:** [tips for getting this changed]

## MISSING PROTECTIONS
[Identify key protections that are absent from this clause/agreement]

## BALANCED INTERPRETATION
[Where the clause could be interpreted in a more favorable light, if applicable]

## OVERALL RISK ASSESSMENT
Give an overall rating: LOW RISK / MODERATE RISK / HIGH RISK / VERY HIGH RISK
Provide a 1-paragraph summary of the overall legal risk profile of this contract.

IMPORTANT: Be specific and practical. Reference the exact language from the contract when identifying issues. Do not be alarmist — note when language is actually standard and reasonable.`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a senior contract attorney specializing in commercial contracts, technology agreements, employment law, and intellectual property. Your analysis should be precise, practical, and actionable. Always reference specific contract language when identifying issues. Be balanced — note when terms are standard and reasonable, not just problematic.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const output = completion.choices[0]?.message?.content || 'No output generated.';

    return NextResponse.json({ output });
  } catch (err: unknown) {
    console.error('Contract analysis error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
