const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use the API key directly 
const apiKey = 'AIzaSyBOPiD3l141F9phLC8YFqki3nO7xY-U3y8';

async function runTest() {
  console.log('API Key starts with:', apiKey.substring(0, 5) + '...');
  
  try {
    // Initialize the API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Testing connection to Gemini API...');
    
    // Try with gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Simple prompt
    const result = await model.generateContent('Say hello world');
    console.log('Response:', result.response.text());
    console.log('API connection successful!');
  } catch (error) {
    console.error('Error connecting to Gemini API:');
    console.error(error.message);
    console.error('Error details:');
    console.error(JSON.stringify(error, null, 2));
    
    if (error.status === 403) {
      console.log('\nTROUBLESHOOTING TIPS:');
      console.log('1. Make sure the API key is valid');
      console.log('2. Ensure the Generative AI API is enabled in your Google Cloud project');
      console.log('3. Verify the API key has permission to access the Generative AI API');
      console.log('4. Check if your Google Cloud project has billing enabled');
    }
  }
}

runTest(); 