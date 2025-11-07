
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateExperiencePoints(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });
  return response.text.trim();
}

export async function generateContentSuggestions(jobTitle: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Act as a professional resume writer. Provide 5-7 example bullet points demonstrating achievements and responsibilities for a person with the job title of '${jobTitle}'. These should be generic examples that a user can adapt. Focus on quantifiable results where possible. Return ONLY a JSON array of strings.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      }
    }
  });

  try {
    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    return suggestions;
  } catch (e) {
    console.error("Failed to parse content suggestions JSON:", e);
    return ["Error: Could not parse content suggestions."];
  }
}

export async function optimizeKeywords(resumeText: string, jobDescription: string): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze the following resume and job description. Identify and suggest 5-10 essential keywords from the job description that are missing or underrepresented in the resume. Return ONLY a JSON array of strings.\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      }
    }
  });

  try {
    const jsonString = response.text.trim();
    const keywords = JSON.parse(jsonString);
    return keywords;
  } catch (e) {
    console.error("Failed to parse keywords JSON:", e);
    return ["Error: Could not parse keyword suggestions."];
  }
}

export async function suggestSkills(experienceText: string, jobDescription: string, currentSkills: string[]): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Based on the following work experience and the target job description, suggest 5-8 relevant skills to add to a resume's skills section. The user already has these skills: [${currentSkills.join(', ')}]. Do not suggest skills they already have. Focus on skills explicitly mentioned in the job description that are relevant to the work experience provided. Return ONLY a JSON array of strings.\n\nWORK EXPERIENCE:\n${experienceText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      }
    }
  });

  try {
    const jsonString = response.text.trim();
    const skills = JSON.parse(jsonString);
    return skills;
  } catch (e) {
    console.error("Failed to parse skill suggestions JSON:", e);
    return ["Error: Could not parse skill suggestions."];
  }
}

export async function checkATSCompliance(resumeText: string): Promise<string> {
  const prompt = `Act as an expert ATS (Applicant Tracking System) checker. Analyze the following resume text and provide a concise, bulleted list of actionable feedback to improve its ATS compatibility. Focus on formatting, keywords, and structure.

  Resume Text:
  ---
  ${resumeText}
  ---
  
  Provide feedback in markdown format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text.trim();
}

export async function matchJobDescription(resumeText: string, jobDescription: string): Promise<{ score: number, analysis: string }> {
  const prompt = `Compare the following resume against the job description. Provide a match score from 0 to 100 and a detailed analysis. The analysis should include strengths, weaknesses, and specific suggestions for improvement.
  
  Format the output as a JSON object with two keys: "score" (a number) and "analysis" (a markdown-formatted string with sections for Strengths, Weaknesses, and Suggestions).
  
  RESUME:
  ${resumeText}
  
  JOB DESCRIPTION:
  ${jobDescription}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          analysis: { type: Type.STRING }
        }
      }
    }
  });

  try {
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return {
      score: result.score || 0,
      analysis: result.analysis || "No analysis provided."
    };
  } catch (e) {
    console.error("Failed to parse job match JSON:", e);
    throw new Error("Could not parse job match analysis.");
  }
}

export async function parseResume(fileData: { mimeType: string; data: string }): Promise<Partial<ResumeData>> {
  const prompt = `Parse the provided resume file and extract its content into a structured JSON object. The resume is provided as a base64 encoded file. Identify all sections: personal information (including name, email, phone, linkedin, website), a professional summary, a list of work experiences (each with title, company, location, start and end dates, and a description of responsibilities/achievements), a list of educational qualifications (with degree, university, location, and graduation date), a list of certificates (with name, issuer, and date), and a list of skills. Ensure dates are concise strings. Format descriptions as bullet points separated by escaped newlines (\\n). If a field is not found, omit it from the JSON. IMPORTANT: Ensure the output is a single, valid JSON object with no extraneous text, and correctly escape all double quotes and other special characters within string values.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data,
          },
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalInfo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              linkedin: { type: Type.STRING },
              website: { type: Type.STRING },
            },
          },
          summary: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['title', 'company', 'description'],
            },
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                degree: { type: Type.STRING },
                university: { type: Type.STRING },
                location: { type: Type.STRING },
                gradDate: { type: Type.STRING },
              },
              required: ['degree', 'university'],
            },
          },
          certificates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                issuer: { type: Type.STRING },
                date: { type: Type.STRING },
              },
              required: ['name', 'issuer'],
            }
          },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
  });

  try {
    let jsonString = response.text.trim();
    // Clean up potential markdown formatting like ```json ... ```
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.substring(3, jsonString.length - 3).trim();
    }
    
    const parsedData = JSON.parse(jsonString) as Partial<ResumeData>;
    if (parsedData.experience) {
        parsedData.experience = parsedData.experience.map(exp => ({ ...exp, id: Date.now() + Math.random() }));
    }
    if (parsedData.education) {
        parsedData.education = parsedData.education.map(edu => ({ ...edu, id: Date.now() + Math.random() }));
    }
    if (parsedData.certificates) {
        parsedData.certificates = parsedData.certificates.map(cert => ({ ...cert, id: Date.now() + Math.random() }));
    }
    return parsedData;
  } catch (e) {
    console.error("Failed to parse resume JSON:", e);
    throw new Error("Could not parse the uploaded resume. Please ensure it is a standard format.");
  }
}

export async function generateCoverLetter(resumeText: string, jobDescription: string): Promise<string> {
  const prompt = `Act as an expert career coach. Based on the provided resume and job description, write a professional and persuasive cover letter. The letter should be tailored to the job, highlighting the most relevant skills and experiences from the resume. Address the key requirements from the job description. Maintain a professional yet enthusiastic tone.

  RESUME:
  ---
  ${resumeText}
  ---

  JOB DESCRIPTION:
  ---
  ${jobDescription}
  ---

  Return only the text of the cover letter.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.8,
    }
  });

  return response.text.trim();
}