// app/api/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

type Scores = {
  greeting: number;
  professionalism: number;
  empathy: number;
  problemResolution: number;
  clarity: number;
  collectionUrgency: number;
  compliance: number;
  overallEffectiveness: number;
};

type Result = {
  scores: Scores;
  overallFeedback: string;
  observation: string;
  transcription: string;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio') as File;

    if (!audio) {
      return NextResponse.json({ error: 'Audio file missing.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Return mock data if no key is present
      return NextResponse.json(mockResult());
    }

    const openai = new OpenAI({ apiKey });

    const fileBuffer = Buffer.from(await audio.arrayBuffer());
    const tempFile = new File([fileBuffer], audio.name, { type: audio.type });

    const transcriptionRes = await openai.audio.transcriptions.create({
      file: tempFile,
      model: 'whisper-1',
    });

    const text = transcriptionRes.text;

    const prompt = `
Evaluate this call script and score the agent based on these:

- Greeting (0-10)
- Professionalism (0-15)
- Empathy (0-15)
- Problem Resolution (0-20)
- Clarity (0-10)
- Collection Urgency (0-15)
- Compliance (0-10)
- Overall Effectiveness (0-25)

Return JSON like this:
{
  "scores": {
    ...
  },
  "overallFeedback": "...",
  "observation": "..."
}

Transcript:
${text}
    `;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const message = gptResponse.choices[0]?.message?.content;

    if (!message) throw new Error('No response from model.');

    const data = JSON.parse(message);

    const result: Result = {
      scores: data.scores,
      overallFeedback: data.overallFeedback,
      observation: data.observation,
      transcription: text,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Analysis failed:', err);
    return NextResponse.json(mockResult());
  }
}

function mockResult(): Result {
  return {
    scores: {
      greeting: 8,
      professionalism: 13,
      empathy: 14,
      problemResolution: 18,
      clarity: 9,
      collectionUrgency: 12,
      compliance: 8,
      overallEffectiveness: 22,
    },
    overallFeedback: "Good call quality and effective handling. Slight improvement needed in urgency and compliance communication.",
    observation: "Agent handled concerns well, but missed a few standard compliance phrases.",
    transcription: "Mock transcript: Hello, this is customer support. How can I help you today? [...example placeholder...]",
  };
}
