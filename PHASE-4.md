# NOVA Browser — Phase 4: AI Assistant

## Overview
Phase 4 introduces an integrated AI Assistant into the NOVA Browser. The AI can analyze the active webpage, answer questions, summarize content, and extract key information without leaving the current context.

## Key Features
1. **AI Sidebar**: A sleek, dark-themed panel that slides out from the right side. It acts as the primary chat interface for the AI assistant.
2. **Page Context Integration**: The AI can read the text content of the active tab. Presets like "Summarize", "Explain", and "Key Points" automatically ingest the page content to generate helpful insights.
3. **Command Palette Integration**: Open the Command Palette (`Ctrl/Cmd + K`) and type "AI" or "Ask NOVA" to quickly launch the assistant.
4. **Custom Settings**: A new `nova://settings` page has been added where you can toggle the AI, choose a provider (Mock/Gemini), select a model, and paste your API key securely.
5. **Secure Architecture**: The AI Service runs entirely in the main process, shielding API keys from webpage content and renderer vulnerabilities.

## How to use
- **Shortcut**: Press `Ctrl/Cmd + Shift + A` to toggle the AI Sidebar anywhere.
- **Toolbar Button**: Click the Sparkles icon (✨) near the URL bar.
- **Command Palette**: Press `Ctrl/Cmd + K` and select "Ask NOVA (AI)".

## AI Provider Configuration
By default, the AI is set to a "Mock" provider to prevent crashes if no API key is provided. To use real AI:
1. Navigate to `nova://settings`.
2. Change the provider to `Google Gemini API`.
3. Paste your Gemini API key.
4. Open the AI Sidebar and start asking questions!
