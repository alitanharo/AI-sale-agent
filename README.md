# Verona Voice — Premium Voice‑Guided Commerce Demo

Verona Voice is a premium fashion storefront demo with a **voice concierge** that can recommend products, answer FAQs, and perform actions like adding items to cart or navigating to product pages.

## ✨ Features
- Premium‑styled storefront UI
- Voice concierge (“Luca”) with conversational responses
- Intent‑driven actions: add to cart, navigate to products, checkout, FAQs

## ✅ How to use the voice concierge
1. Click **Speak to Luca** in the concierge panel.
2. Try commands like:
   - “Recommend a summer dress.”
   - “Add the navy striped dress to cart.”
   - “Show me the beige dress.”
   - “What is your return policy?”

## 🚀 Run locally
**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your API key in `.env.local`:
   ```
   API_KEY=YOUR_KEY_HERE
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## 🌍 Deploy to Vercel (step‑by‑step)
1. Push your repo to GitHub.
2. Go to https://vercel.com and import the repository.
3. Set the environment variable:
   - `API_KEY` = your language-model API key
4. Build settings:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output: `dist`
5. Deploy.

## 🧩 Tech Stack
- React + TypeScript + Vite
- @google/genai (language model integration)

## 📌 Notes
This project is a demo and does not process real payments.
