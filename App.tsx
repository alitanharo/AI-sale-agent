
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import FaqPage from './components/FaqPage';
import ChatAgentIcon from './components/ChatAgentIcon';
import ChatAgentUI from './components/ChatAgentUI';
import { Product, CartItem, FaqItem, ConciergeResponse, AddToCartIntent, NavigateToProductIntent, GetProductRecommendationIntent } from './types';
import { SAMPLE_PRODUCTS, SAMPLE_FAQS }
from './constants';
import { getProductById as fetchProductById, getProducts as fetchProducts } from './services/productService'; 

const AppContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      setFaqs(SAMPLE_FAQS); 
    };
    loadData();
  }, []);

  const addToCart = useCallback((productId: string, quantity: number = 1): string => {
    const productToAdd = products.find(p => p.id === productId);
    if (!productToAdd) {
      console.error("Product not found for ID:", productId);
      return `Sorry, I could not find the product with ID ${productId}.`;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...productToAdd, quantity }];
    });
    return `${productToAdd.name} has been added to your cart.`;
  }, [products]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]);

  const handleAgentResponse = useCallback((response: ConciergeResponse): string => {
    let userFeedbackMessage = response.message;

    switch (response.intent) {
      case 'ADD_TO_CART':
        const addToCartResponse = response as AddToCartIntent;
        if (addToCartResponse.productId) {
          userFeedbackMessage = addToCart(addToCartResponse.productId) || "Error adding to cart.";
        } else if (addToCartResponse.productName) {
          const matchedProduct = products.find(p => p.name.toLowerCase().includes(addToCartResponse.productName!.toLowerCase()));
          if (matchedProduct) {
            userFeedbackMessage = addToCart(matchedProduct.id) || "Error adding to cart.";
          } else {
            userFeedbackMessage = `Sorry, I couldn't find a product named "${addToCartResponse.productName}" to add to your cart.`;
          }
        } else {
          userFeedbackMessage = "I couldn't figure out which product to add. Can you be more specific?";
        }
        break;
      case 'NAVIGATE_TO_PRODUCT':
        const navigateResponse = response as NavigateToProductIntent;
        if (navigateResponse.productId) {
          const targetProduct = products.find(p => p.id === navigateResponse.productId);
          navigate(`/products/${navigateResponse.productId}`);
          userFeedbackMessage = `Taking you to ${targetProduct?.name || 'the product page'}.`;
        } else if (navigateResponse.productName) {
           const matchedProduct = products.find(p => p.name.toLowerCase().includes(navigateResponse.productName!.toLowerCase()));
           if (matchedProduct) {
             navigate(`/products/${matchedProduct.id}`);
             userFeedbackMessage = `Taking you to ${matchedProduct.name}.`;
           } else {
             userFeedbackMessage = `Sorry, I couldn't find a product named "${navigateResponse.productName}".`;
           }
        } else {
          userFeedbackMessage = "I'm not sure which product you want to see. Can you tell me the name or ID?";
        }
        break;
      case 'ANSWER_FAQ':
        if (location.pathname !== '/faq' && response.message) {
           // userFeedbackMessage = response.message + " You can find more information on our FAQ page.";
           // navigate('/faq'); // Optional: navigate to FAQ page
        }
        break;
      case 'GET_PRODUCT_RECOMMENDATION':
        const recommendIntent = response as GetProductRecommendationIntent;
        userFeedbackMessage = recommendIntent.message; // Start with the concierge's base message

        if (recommendIntent.suggestedProductIds && recommendIntent.suggestedProductIds.length > 0) {
            const firstValidId = recommendIntent.suggestedProductIds.find(id => products.some(p => p.id === id));
            if (firstValidId) {
                const product = products.find(p => p.id === firstValidId)!; // We know it exists from .find()
                navigate(`/products/${firstValidId}`);
                // Override or prepend to the concierge's message for a more direct action confirmation
                userFeedbackMessage = `Based on your request for "${recommendIntent.query}", I think you might like ${product.name}. I'm taking you to its page now!`;
            }
        } else if (recommendIntent.suggestedKeywords && recommendIntent.suggestedKeywords.length > 0) {
            // The message should ideally already incorporate these keywords.
            // We can add a suggestion to browse all products.
            if (location.pathname !== '/') {
              // userFeedbackMessage += " You can browse all our products to find something suitable.";
              // navigate('/'); // Optional: navigate to all products
            }
        }
        // If neither specific IDs nor keywords lead to an action, the concierge's original message is spoken.
        // No random navigation.
        break;
      case 'NAVIGATE_TO_CHECKOUT':
        navigate('/cart'); // Cart page has the "Proceed to Checkout" button
        // userFeedbackMessage is already set by the concierge.
        break;
      case 'GENERAL_QUERY':
      case 'ERROR':
        break;
      default:
        userFeedbackMessage = "I'm not sure how to handle that. Can you try again?";
    }
    return userFeedbackMessage || "Sorry, I didn't quite understand that."; // Fallback for empty messages
  }, [addToCart, navigate, products, location.pathname]);


  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header cartItemCount={cartItemCount} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ProductList products={products} addToCart={addToCart} />} />
          <Route path="/products/:productId" element={<ProductDetail products={products} addToCart={addToCart} />} />
          <Route path="/cart" element={<CartPage cartItems={cart} removeFromCart={removeFromCart} updateCartQuantity={updateCartQuantity} />} />
          <Route path="/faq" element={<FaqPage faqs={faqs} />} />
        </Routes>
      </main>
      <Footer />
      <ChatAgentIcon onClick={() => setIsChatOpen(prev => !prev)} />
      {isChatOpen && (
        <ChatAgentUI
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          products={products}
          faqs={faqs}
          onAgentAction={handleAgentResponse}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;