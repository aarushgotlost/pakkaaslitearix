
const GEMINI_API_KEY = 'AIzaSyDuKMVN4neXrTUpGlkdVK6e85fxyaoGEEY';

export interface GenerateContentRequest {
  prompt: string;
  contentType: 'blog' | 'story';
  language: string;
  tone?: string;
  profession?: string;
  writerStyle?: string;
}

export async function generateContent({ 
  prompt, 
  contentType, 
  language, 
  tone = 'Neutral',
  profession = '',
  writerStyle = 'Neutral'
}: GenerateContentRequest): Promise<string> {
  const basePrompt = contentType === 'blog' ? `You are a professional blog writer. Create an engaging, well-structured blog post about: ${prompt}. Include a compelling title, introduction, main content with subheadings, and conclusion.` : `You are a creative story writer. Write an engaging, imaginative story based on: ${prompt}. Include compelling characters, vivid descriptions, dialogue, and a satisfying narrative arc. Be creative and entertaining.`;
  
  let systemPrompt = `${basePrompt} Write in ${language} language and respond in plain text, avoiding any Markdown formatting like ## or **.`;
  
  // Add tone if not neutral
  if (tone !== 'Neutral') {
    systemPrompt += ` Use a ${tone.toLowerCase()} tone.`;
  }
  
  // Add profession perspective if provided
  if (profession.trim()) {
    systemPrompt += ` Write from the perspective of ${profession}.`;
  }
  
  // Add writer style if not neutral
  if (writerStyle !== 'Neutral') {
    systemPrompt += ` Use a ${writerStyle.toLowerCase()} writing style.`;
  }
  
  // Special handling for humanized options
  if (tone === 'Humanized' || writerStyle === 'Humanized') {
    systemPrompt += ` Make the writing sound natural, conversational, and human-like. Avoid robotic or overly formal language. Include personal touches and relatable elements.`;
  }

  console.log('Generating content with prompt:', systemPrompt);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      
      // Extract specific error message from Gemini API response
      const errorMessage = errorData?.error?.message || `${response.status} ${response.statusText}`;
      throw new Error(`Failed to generate content: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response structure:', data);
      throw new Error('No content generated - invalid response structure');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Generated content length:', generatedText.length);
    
    return generatedText;
  } catch (error) {
    console.error('Error generating content:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error('Failed to generate content. Please try again.');
  }
}
