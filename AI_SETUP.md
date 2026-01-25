# AI Setup Guide

## Overview

The Period Analysis system supports two AI providers for generating predictions:

1. **Google Gemini** (Recommended) - Free tier available, excellent quality
2. **OpenAI GPT-4** (Alternative) - Paid service, also excellent quality

The system will automatically use whichever API key you provide, with preference for Gemini.

---

## Option 1: Google Gemini (Recommended)

### Why Gemini?
- ✅ Free tier with generous limits
- ✅ Excellent quality predictions
- ✅ Fast response times
- ✅ Easy to get started

### Setup Steps:

1. **Get API Key**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key

2. **Install Package**
   ```bash
   pip install google-generativeai
   ```

3. **Configure Environment**
   ```bash
   # Create or edit .env file
   echo "GEMINI_API_KEY=your_actual_api_key_here" >> .env
   ```

4. **Test It**
   ```bash
   python3 -c "from astro_app.backend.services.ai_predictions import AIPredictionService; svc = AIPredictionService(); print(f'AI enabled: {svc.enabled}, Provider: {svc.provider}')"
   ```

   Expected output:
   ```
   ✅ AI Service initialized with Google Gemini
   AI enabled: True, Provider: gemini
   ```

---

## Option 2: OpenAI GPT-4

### Why OpenAI?
- ✅ Industry-leading quality
- ✅ Well-documented API
- ⚠️ Paid service (requires credits)

### Setup Steps:

1. **Get API Key**
   - Go to: https://platform.openai.com/api-keys
   - Sign in or create account
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Install Package**
   ```bash
   pip install openai
   ```

3. **Configure Environment**
   ```bash
   echo "OPENAI_API_KEY=sk-your_actual_api_key_here" >> .env
   ```

4. **Test It**
   ```bash
   python3 -c "from astro_app.backend.services.ai_predictions import AIPredictionService; svc = AIPredictionService(); print(f'AI enabled: {svc.enabled}, Provider: {svc.provider}')"
   ```

   Expected output:
   ```
   ✅ AI Service initialized with OpenAI GPT-4
   AI enabled: True, Provider: openai
   ```

---

## Using Both (Automatic Fallback)

You can configure both API keys. The system will:
1. Try Gemini first (if `GEMINI_API_KEY` is set)
2. Fall back to OpenAI (if Gemini fails)
3. Fall back to rule-based predictions (if both fail)

```bash
# .env file
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

---

## Force Specific Provider

If you want to force a specific provider:

```bash
# .env file
AI_PROVIDER=gemini  # or 'openai'
GEMINI_API_KEY=your_key
```

---

## No AI (Rule-Based Predictions)

If you don't set any API keys, the system will use rule-based predictions:
- Based on score ranges
- Simple, deterministic
- No API calls
- Always available

---

## Testing AI Predictions

### Quick Test
```python
from astro_app.backend.services.ai_predictions import AIPredictionService

service = AIPredictionService()

if service.enabled:
    print(f"✅ AI is enabled using {service.provider}")
    
    # Test prediction
    context = {
        'average_score': 75,
        'trend': 'improving',
        'excellent_days': 5,
        'good_days': 10,
        'average_days': 10,
        'below_average_days': 3,
        'poor_days': 2
    }
    
    predictions = service.generate_period_predictions(
        context=context,
        birth_details={'name': 'Test'},
        events=[],
        daily_results=[]
    )
    
    print(f"\nPrediction Provider: {predictions.get('provider')}")
    print(f"Model: {predictions.get('model')}")
    print(f"\nOverall: {predictions.get('overall')}")
else:
    print("❌ AI is disabled - using rule-based predictions")
```

---

## API Costs

### Google Gemini
- **Free Tier**: 60 requests per minute
- **Cost**: FREE for most use cases
- **Limits**: Very generous for personal/small business use

### OpenAI GPT-4
- **Cost**: ~$0.03 per 1K tokens (input) + $0.06 per 1K tokens (output)
- **Typical Request**: ~$0.05-0.10 per prediction
- **Monthly**: Depends on usage (estimate $10-50 for moderate use)

---

## Troubleshooting

### "AI Service disabled (no API key found)"
- Check your `.env` file exists in project root
- Verify the key name is exactly `GEMINI_API_KEY` or `OPENAI_API_KEY`
- Restart your backend server after adding keys

### "google-generativeai package not installed"
```bash
pip install google-generativeai
```

### "openai package not installed"
```bash
pip install openai
```

### "Invalid API key"
- Verify you copied the entire key
- Check for extra spaces or quotes
- Regenerate the key if needed

### Predictions are generic/rule-based
- Check if AI is actually enabled: `service.enabled` should be `True`
- Check logs for error messages
- Verify API key is valid

---

## Environment Variables Reference

```bash
# Required (choose at least one)
GEMINI_API_KEY=your_gemini_key          # Google Gemini API key
OPENAI_API_KEY=your_openai_key          # OpenAI API key

# Optional
AI_PROVIDER=gemini                       # Force specific provider
```

---

## Recommendation

**For most users**: Use Google Gemini
- Free
- Easy to set up
- Excellent quality
- No credit card required

**For enterprise/production**: Consider both
- Use Gemini as primary
- OpenAI as fallback
- Maximum reliability

---

## Next Steps

1. Choose your AI provider
2. Get API key
3. Install required package
4. Configure `.env` file
5. Restart backend server
6. Test predictions

**Need help?** Check the logs or contact support.
