// Simple Gemini API test
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Simple test function
const testSimpleGemini = async (apiKey) => {
  try {
    console.log('🔍 Testing API key validity...');
    console.log('API key format:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'Not provided');
    
    const simplePrompt = "Please answer in one sentence: What is ESG?";
    
    const requestBody = {
      contents: [{
        parts: [{
          text: simplePrompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
      }
    };
    
    console.log('📤 Sending simple request...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error:', errorText);
      
      // Parse error information
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.details) {
          const apiKeyError = errorData.error.details.find(detail => 
            detail.reason === 'API_KEY_INVALID'
          );
          
          if (apiKeyError) {
            console.error('🔑 API key issue:');
            console.error('  - Key may be invalid or expired');
            console.error('  - Key may not have correct permissions');
            console.error('  - Key format may be incorrect');
            console.error('');
            console.error('💡 Solution:');
            console.error('  1. Visit https://makersuite.google.com/app/apikey');
            console.error('  2. Create a new API key');
            console.error('  3. Ensure the key has Gemini API access permissions');
            console.error('  4. Check if the key contains correct characters');
          }
        }
      } catch (e) {
        console.error('Unable to parse error details');
      }
      
      return false;
    }

    const data = await response.json();
    console.log('✅ API call successful!');
    console.log('🤖 AI response:', data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response content');
    
    return true;
  } catch (error) {
    console.error('❌ Network error:', error.message);
    return false;
  }
};

// Validate API key format
const validateApiKeyFormat = (apiKey) => {
  if (!apiKey) {
    console.error('❌ No API key provided');
    return false;
  }
  
  if (apiKey.length < 30) {
    console.error('❌ API key too short, may be invalid');
    return false;
  }
  
  if (!apiKey.startsWith('AIza')) {
    console.error('❌ API key format incorrect, should start with "AIza"');
    return false;
  }
  
  console.log('✅ API key format looks correct');
  return true;
};

// Main test function
const runSimpleTest = async () => {
  const apiKey = process.env.GEMINI_API_KEY || process.argv[2];
  
  console.log('=== Gemini API Simple Test ===\n');
  
  if (!apiKey) {
    console.error('❌ Please provide API key:');
    console.error('Method 1: GEMINI_API_KEY=your_key node test-gemini-simple.js');
    console.error('Method 2: node test-gemini-simple.js your_key');
    console.error('');
    console.error('💡 Get API key:');
    console.error('  1. Visit https://makersuite.google.com/app/apikey');
    console.error('  2. Login to Google account');
    console.error('  3. Click "Create API Key"');
    console.error('  4. Copy the generated key');
    process.exit(1);
  }
  
  // Validate format
  if (!validateApiKeyFormat(apiKey)) {
    process.exit(1);
  }
  
  // Test API
  const success = await testSimpleGemini(apiKey);
  
  if (success) {
    console.log('\n🎉 Test successful! API key is valid and can be used normally.');
  } else {
    console.log('\n💡 If API key is invalid, please:');
    console.log('  1. Check if the key is copied correctly');
    console.log('  2. Confirm the key has Gemini API permissions');
    console.log('  3. Try creating a new API key');
    console.log('  4. Check if the account has sufficient quota');
  }
  
  console.log('\n=== Test Complete ===');
};

// Run test
if (require.main === module) {
  runSimpleTest();
}

module.exports = { testSimpleGemini, validateApiKeyFormat }; 