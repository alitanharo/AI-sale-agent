
import { GoogleGenAI } from "@google/genai";
import { Product, FaqItem, ConciergeResponse, ErrorIntent, GetProductRecommendationIntent } from '../types';
import { MODEL_NAME, DEFAULT_CONCIERGE_ERROR_MESSAGE, APP_NAME } from '../constants';

// Ensure API_KEY is accessed from process.env
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });

interface AgentContext {
  lastRecommendedProductIds?: string[];
}

const constructPrompt = (query: string, products: Product[], faqs: FaqItem[], context?: AgentContext): string => {
  const productInfo = products.map(p => `- ${p.name} (ID: ${p.id}, Price: $${p.price.toFixed(2)}, Category: ${p.category}, Description: ${p.description})`).join('\n');
  const faqInfo = faqs.map(f => `- Q: ${f.question} (Key: faq${f.id.substring(3)}) A: ${f.answer}`).join('\n');

  let contextInfo = "";
  if (context && context.lastRecommendedProductIds && context.lastRecommendedProductIds.length > 0) {
    const recommendedProductsInfo = context.lastRecommendedProductIds.map(id => {
      const prod = products.find(p => p.id === id);
      return prod ? `- ${prod.name} (ID: ${id})` : `- Unknown Product (ID: ${id})`;
    }).join('\n');
    contextInfo = `
Context from previous turn:
The following product(s) were recently recommended or mentioned:
${recommendedProductsInfo}

If the user's current query is a follow-up like "add it to the cart", "yes, that one", "what about that one?", or "tell me more about it" and it seems to refer to a product from this context, please use the product ID(s) from the context.
If multiple products are in context and the user says an ambiguous "add it to cart" (referring to no specific name), assume they mean the *first product ID listed in the context above* for the ADD_TO_CART or NAVIGATE_TO_PRODUCT intent. Your 'message' should reflect which product you've chosen, e.g., "Okay, adding [Product Name of first ID from context] to your cart."
If the user clarifies (e.g. "add the second one" or a specific name from context), prioritize that.
`;
  }

  return `
You are "Luca", a refined voice concierge for the fashion store "${APP_NAME}".
Your goal is to understand user requests related to shopping, product information, and FAQs, and then respond with a JSON object detailing the recognized intent and necessary information.
${contextInfo}
User's voice input: "${query}"

Available Products:
${productInfo}

Frequently Asked Questions (FAQs):
${faqInfo}

Based on the user's query AND ANY RELEVANT CONTEXT, determine the intent and provide a response.
Possible intents are:
1.  ADD_TO_CART: User wants to add a product to their cart.
    - Extract product ID if mentioned directly in the current query.
    - If not mentioned directly, but the query is a follow-up to a product in CONTEXT (see "Context from previous turn"), infer the product ID from there.
    - If only a product name is mentioned (in query or context), extract the name.
    - JSON: {"intent": "ADD_TO_CART", "productId": "...", "productName": "...", "message": "Adding {productName} to your cart."} or similar confirmation.
2.  NAVIGATE_TO_PRODUCT: User wants to see a specific product.
    - Extract product ID or name from the current query or CONTEXT if it's a follow-up.
    - JSON: {"intent": "NAVIGATE_TO_PRODUCT", "productId": "...", "productName": "...", "message": "Sure, taking you to {productName}."}
3.  GET_PRODUCT_RECOMMENDATION: User asks for recommendations (e.g., "recommend a t-shirt", "what's good for summer?", "birthday gift for my mother").
    - Analyze the query. If you can identify specific products from the list that are good matches, include their IDs in 'suggestedProductIds'. 
    - If not specific products, but you can identify useful keywords (e.g., 't-shirt', 'backpack', 'gift for mom', 'summer'), include them in 'suggestedKeywords'.
    - The 'message' should be a friendly, conversational recommendation based on your findings.
    - JSON Example: {"intent": "GET_PRODUCT_RECOMMENDATION", "query": "birthday gift for mom", "suggestedKeywords": ["gift", "accessories"], "suggestedProductIds": ["prod5"], "message": "For your mom's birthday, the Vintage Leather Wallet could be a great choice! Or you might look for other accessories."}
    - If no specific products or keywords can be derived, the message should still be helpful.
4.  ANSWER_FAQ: User asks a question covered in the FAQ.
    - Identify the relevant FAQ.
    - JSON: {"intent": "ANSWER_FAQ", "questionKey": "faqX", "answer": "{answer_from_faq}", "message": "{answer_from_faq}"}
5.  NAVIGATE_TO_CHECKOUT: User wants to go to the checkout page (e.g., "take me to checkout", "I want to checkout").
    - JSON: {"intent": "NAVIGATE_TO_CHECKOUT", "message": "Alright, heading to the checkout page now."}
6.  GENERAL_QUERY: For any other query, or if intent is unclear even with context.
    - JSON: {"intent": "GENERAL_QUERY", "message": "Your helpful response..."}

IMPORTANT:
- ALWAYS respond with a valid JSON object matching one of the intent structures.
- If a product ID is clearly identifiable (e.g., "product with ID prod1"), use it.
- If you cannot determine a specific product ID or name for ADD_TO_CART or NAVIGATE_TO_PRODUCT, even with context, you can omit "productId" or "productName" but still try to provide a helpful message like "Which product were you interested in?".
- Your "message" field will be spoken to the user, so make it conversational and clear.
`;
};


export const getAgentResponse = async (
  query: string, 
  products: Product[], 
  faqs: FaqItem[],
  context?: AgentContext
): Promise<ConciergeResponse> => {
  if (!API_KEY) {
    return { intent: "ERROR", message: "The concierge is currently unavailable. API key is missing." };
  }
  
  const prompt = constructPrompt(query, products, faqs, context);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    let jsonStr = (response.text ?? "{}").trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedResponse = JSON.parse(jsonStr) as ConciergeResponse; 
    
    if (!parsedResponse.intent || !parsedResponse.message) {
    console.error("Model response missing intent or message:", parsedResponse);
        throw new Error("Invalid response structure from the concierge model.");
    }
     if (parsedResponse.intent === "GET_PRODUCT_RECOMMENDATION") {
        const GPRIntent = parsedResponse as GetProductRecommendationIntent;
        if (!GPRIntent.suggestedProductIds) GPRIntent.suggestedProductIds = [];
        if (!GPRIntent.suggestedKeywords) GPRIntent.suggestedKeywords = [];
    }

    return parsedResponse;

  } catch (error) {
    console.error("Error calling the language model or parsing response:", error);
    const errorIntent: ErrorIntent = {
      intent: 'ERROR',
      message: DEFAULT_CONCIERGE_ERROR_MESSAGE,
    };
    return errorIntent;
  }
};