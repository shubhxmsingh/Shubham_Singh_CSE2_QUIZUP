import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    // Hard-code the API key temporarily for testing
    const apiKey = 'AIzaSyBOPiD3l141F9phLC8YFqki3nO7xY-U3y8';
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key not configured', 
        success: false 
      }, { status: 500 });
    }
    
    console.log("API Key (first few chars):", apiKey.substring(0, 5) + "...");
    
    // Initialize Gemini API with the standard model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simple test prompt
    const prompt = "Say hello in JSON format";
    
    console.log("Sending test request to Gemini API");
    const result = await model.generateContent(prompt);
    console.log("Received response from Gemini API");
    
    const text = result.response.text();
    
    // Clean the response if it's in a markdown code block
    let cleanedResponse = text;
    if (text.includes('```')) {
      const match = text.match(/```(?:json)?\s*\n([\s\S]*?)```/);
      if (match && match[1]) {
        cleanedResponse = match[1].trim();
        console.log("Extracted content from markdown code block");
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Gemini API is working correctly",
      response: cleanedResponse
    });
    
  } catch (error) {
    console.error('Gemini API test error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Gemini API test failed',
      success: false
    }, { status: 500 });
  }
} 