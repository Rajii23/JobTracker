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

    if (!jdText || jdText.length < 50) {
        return res.status(200).json({
            summary: "The provided job description is too short for analysis.",
            rewrittenPoints: [],
            suggestedPoints: ["Please paste the full job description to get specific suggestions."],
            matchScore: 0
        });
    }

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
            summary: "AI analysis unavailable (Check API Key). Showing sample data: Your background is a great match. To stand out, emphasize your experience with relevant skills mentioned in the JD.",
            rewrittenPoints: [
                "Optimized system performance using relevant technologies, improving processing speed by 40%.",
                "Led a team to deliver a key project that matched business requirements."
            ],
            suggestedPoints: [
                "Collaborated with cross-functional teams to define architecture and requirements.",
                "Implemented automated processes to reduce deployment time."
            ],
            matchScore: 0
        });
    }
};

export const getCoverLetter = async (req: Request, res: Response) => {
    const { jdText, resumeText } = req.body;

    if (!jdText || jdText.length < 50) {
        return res.status(200).json({ text: "Please provide a longer job description (at least 50 characters) to generate a customized cover letter." });
    }

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
        res.status(200).json({ text: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the position. With my background and passion for this field, I am confident I would be a great addition to your team.\n\n(Note: This is a placeholder. Please configure your OpenAI API key to get personalized results based on your specific job description and resume.)\n\nThank you for your time and consideration.\n\nBest regards,\nJob Tracker User` });
    }
};

export const getInterviewQuestions = async (req: Request, res: Response) => {
    const { jdText } = req.body;

    if (!jdText || jdText.length < 50) {
        return res.status(200).json({
            questions: [
                "The job description provided is too short.",
                "Please provide more details to generate specific interview questions.",
                "What specific skills are required for this role?",
                "Can you describe the responsibilities mentioned in the full description?",
                "Why are you interested in this role?"
            ]
        });
    }

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
                "Can you walk us through a challenging problem you solved recently?",
                "How do you approach learning a new technology or skill required for this role?",
                "Tell us about a time you had to work with a difficult teammate.",
                "What is your experience with the core technologies listed in this job description?",
                "Why are you interested in this specific role and our company?"
            ]
        });
    }
};

export const getKeywordAnalysis = async (req: Request, res: Response) => {
    const { jdText, resumeText } = req.body;

    if (!jdText || jdText.length < 50) {
        return res.status(200).json({
            missingKeywords: ["(Job Description too short)"],
            matchedKeywords: [],
            keyPointers: ["Please paste the full job description (at least 50 characters) to analyze keywords."]
        });
    }

    try {
        if (!process.env.OPENAI_API_KEY) throw new Error('No API Key');
        const completion = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an ATS expert. Analyze the JD and Resume. Return JSON." },
                { role: "user", content: `Job Description: ${jdText}\n\nResume: ${resumeText}\n\nProvide:\n1. missingKeywords (list of strings)\n2. matchedKeywords (top 5 list)\n3. keyPointers (3 short actionable tips)\nReturn JSON only.` }
            ],
            response_format: { type: "json_object" }
        });
        res.status(200).json(JSON.parse(completion.choices[0].message.content || '{}'));
    } catch (error) {
        console.warn('AI Error or No Key, using mock keywords');
        res.status(200).json({
            missingKeywords: ["Sample Keyword 1", "Sample Keyword 2"],
            matchedKeywords: ["Sample Match"],
            keyPointers: [
                "This is sample data because the AI service is unavailable.",
                "Please check your OpenAI API key configuration.",
                "Ensure your job description provides enough detail for analysis."
            ]
        });
    }
};
