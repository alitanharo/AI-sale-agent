
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

// Concierge Response Types
export interface AddToCartIntent {
  intent: "ADD_TO_CART";
  productId?: string;
  productName?: string;
  message: string;
}
export interface NavigateToProductIntent {
  intent: "NAVIGATE_TO_PRODUCT";
  productId?: string;
  productName?: string;
  message: string;
}
export interface GetProductRecommendationIntent {
  intent: "GET_PRODUCT_RECOMMENDATION";
  query?: string;
  suggestedProductIds?: string[];
  suggestedKeywords?: string[];
  message: string;
}
export interface AnswerFaqIntent {
  intent: "ANSWER_FAQ";
  questionKey?: string; // e.g., "return_policy"
  answer?: string;
  message: string;
}
export interface NavigateToCheckoutIntent {
  intent: "NAVIGATE_TO_CHECKOUT";
  message: string;
}
export interface GeneralQueryIntent {
  intent: "GENERAL_QUERY";
  message: string;
}
export interface ErrorIntent {
  intent: "ERROR";
  message: string;
}

export type ConciergeResponse = 
  | AddToCartIntent 
  | NavigateToProductIntent 
  | GetProductRecommendationIntent 
  | AnswerFaqIntent
  | NavigateToCheckoutIntent
  | GeneralQueryIntent
  | ErrorIntent;