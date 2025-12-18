import { Request, Response } from 'express';
import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

const getOpenAI = (): OpenAI => {
    if (!openaiInstance) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is not configured');
        }
        openaiInstance = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openaiInstance;
};

export const getResumeSuggestions = async (req: Request, res: Response) => {
    const { jdText, resumeText } = req.body;
    try {
        if (!process.env.OPENAI_API_KEY) throw new Error('No API Key');
        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a career coach. Analyze the job description and resume. Return JSON." },
                { role: "user", content: `Job Description: ${jdText}\n\nResume: ${resumeText}\n\nProvide:\n1. 2-sentence summary.\n2. Rewrite 3-6 bullet points.\n3. Suggest 2-4 new bullet points.\nInclude confidence scores. Return JSON only.` }
            ],
            response_format: { type: "json_object" }
        });
        res.status(200).json(JSON.parse(completion.choices[0].message.content || '{}'));
    } catch (error) {
        console.warn('AI Error or No Key, using mock suggestions');
        res.status(200).json({
            summary: "Your background in software engineering is a great match. To stand out, emphasize your experience with distributed systems and cloud architecture mentioned in the JD.",
            rewrittenPoints: [
                "Architected and deployed a microservices-based tracking system using Node.js and React, improving processing speed by 40%.",
                "Led a team of 4 to deliver a cross-platform mobile app that reached 10k+ active users."
            ],
            suggestedPoints: [
                "Collaborated with cross-functional teams to define architecture and requirements for high-availability systems.",
                "Implemented automated CI/CD pipelines reducing deployment time by 60%."
            ],
            matchScore: 85
        });
    }
};

export const getCoverLetter = async (req: Request, res: Response) => {
    const { jdText, resumeText } = req.body;
    try {
        if (!process.env.OPENAI_API_KEY) throw new Error('No API Key');
        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a professional cover letter writer." },
                { role: "user", content: `Job Description: ${jdText}\n\nResume: ${resumeText}\n\nWrite a 3-paragraph personalized cover letter. Return plain text.` }
            ]
        });
        res.status(200).json({ text: completion.choices[0].message.content });
    } catch (error) {
        console.warn('AI Error or No Key, using mock cover letter');
        res.status(200).json({ text: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the Developer position. With my background in full-stack development and passion for building scalable solutions, I am confident I would be a great addition to your team.\n\nIn my previous roles, I have consistently delivered high-quality software and worked effectively in agile environments. I am particularly impressed by your company's commitment to innovation and look forward to the possibility of contributing to your success.\n\nThank you for your time and consideration.\n\nBest regards,\nJob Tracker User` });
    }
};

export const getInterviewQuestions = async (req: Request, res: Response) => {
    const { jdText } = req.body;
    try {
        if (!process.env.OPENAI_API_KEY) throw new Error('No API Key');
        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an interviewer. Generate 5 interview questions based on the JD. Return JSON." },
                { role: "user", content: `Job Description: ${jdText}\n\nReturn JSON: { questions: string[] }` }
            ],
            response_format: { type: "json_object" }
        });
        res.status(200).json(JSON.parse(completion.choices[0].message.content || '{}'));
    } catch (error) {
        console.warn('AI Error or No Key, using mock questions');
        res.status(200).json({
            questions: [
                "Can you walk us through a challenging technical problem you solved recently?",
                "How do you approach learning a new technology or framework?",
                "Tell us about a time you had to work with a difficult teammate. How did you handle it?",
                "What is your experience with CI/CD and automated testing?",
                "Why are you interested in this specific role and our company?"
            ]
        });
    }
};
