# Resume Builder AI Setup Guide

## 🤖 AI Suggestions Configuration

The Resume Builder now includes AI-powered suggestions using Hugging Face's inference API. Follow these steps to set it up:

### 1. Get Hugging Face API Token

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in

3. Go to your profile settings
4. Navigate to "Access Tokens"
5. Create a new token with "read" permissions
6. Copy the token

### 2. Set Environment Variables

Create a `.env` file in your project root with the following:

```env
# Hugging Face API Token for AI Suggestions
VITE_HF_TOKEN=your_actual_huggingface_token_here

# Firebase Configuration (if not already set)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Features

The AI suggestions feature provides:

- **Smart Content Recommendations** for resume sections
- **Context-aware suggestions** based on current data
- **Professional writing improvements**
- **Fallback suggestions** if API is unavailable

### 4. Supported Sections

- **Personal Summary** - Professional summary suggestions
- **Skills** - Technology and skill recommendations
- **Experience** - Achievement and responsibility suggestions

### 5. Usage

1. Click the "🤖 AI Suggestions" button in any supported section
2. Wait for AI to generate suggestions
3. Click on any suggestion to apply it to your resume
4. Suggestions are automatically saved with your resume

### 6. Troubleshooting

If you see "No suggestions available":
- Check your Hugging Face API token
- Ensure you have internet connection
- The system will fall back to default suggestions

### 7. Privacy

- Your resume data is sent to Hugging Face for AI processing
- No data is stored permanently on external servers
- All processing is done in real-time for suggestions only

## 🚀 Getting Started

1. Set up your `.env` file with the required tokens
2. Restart your development server
3. Navigate to the Resume Builder
4. Try the AI suggestions feature in any section!

---

**Note**: The AI suggestions feature requires a valid Hugging Face API token to function. Without it, the system will use default suggestions. 