
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, FaqItem, ChatMessage, ConciergeResponse, GetProductRecommendationIntent } from '../types';
import { getAgentResponse } from '../services/conciergeService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon'; 
import { CloseIcon } from './icons/CloseIcon';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { DEFAULT_CONCIERGE_ERROR_MESSAGE } from '../constants';


interface ChatAgentUIProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  faqs: FaqItem[];
  onAgentAction: (response: ConciergeResponse) => string; 
}

interface AgentContext {
  lastRecommendedProductIds?: string[];
}

const ChatAgentUI: React.FC<ChatAgentUIProps> = ({ isOpen, onClose, products, faqs, onAgentAction }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [initialInteractionDone, setInitialInteractionDone] = useState(false);
  const [agentContext, setAgentContext] = useState<AgentContext | undefined>(undefined);
  
  const { transcript, interimTranscript, isListening, startListening, stopListening, error: speechRecognitionError, resetTranscript, isSupported: speechRecSupported } = useSpeechRecognition();
  const { speak, isSpeaking, cancelSpeech, isSupported: speechSynthSupported } = useSpeechSynthesis();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const isListeningRef = useRef(isListening); 

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isOpen) {
      if (!initialInteractionDone && speechSynthSupported && speechRecSupported && !isAgentThinking && !isListeningRef.current) {
        const welcomeMsgText = "Welcome to Verona Voice. I'm Luca, your concierge for effortless shopping. How may I assist you?";
        
        const welcomeMessageExists = chatHistory.some(msg => msg.id === 'nina-initial-welcome');
        if (!welcomeMessageExists) {
             setChatHistory(prev => [{ id: 'nina-initial-welcome', sender: 'agent', text: welcomeMsgText, timestamp: new Date() }, ...prev.filter(m => m.id !== 'nina-initial-welcome')]);
        }

        speak(welcomeMsgText, () => {
          if (speechRecSupported && !isListeningRef.current) { 
            startListening();
          }
          setInitialInteractionDone(true);
        });
      } else if (!speechRecSupported || !speechSynthSupported) {
        const supportMessageText = !speechRecSupported 
          ? "Speech recognition is not supported in your browser." 
          : "Speech synthesis is not supported in your browser.";

      }
    } else {
      // Reset for next open
      setInitialInteractionDone(false); 
      setAgentContext(undefined); // Clear context when chat is closed
      if (isListeningRef.current) stopListening();
      if (isSpeaking) cancelSpeech();
      // setChatHistory([]); // Optionally clear history on close
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, speechRecSupported, speechSynthSupported, speak, startListening, stopListening, cancelSpeech, isAgentThinking]); // Removed chatHistory to prevent re-triggering welcome on history update
  
  const handleTranscriptSubmit = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) {
      if(speechRecognitionError && speechRecognitionError.includes("No speech")) {
        const noSpeechMessage: ChatMessage = {
            id: Date.now().toString() + '_no_speech',
            sender: 'agent',
            text: "I didn't catch that. Could you please speak again?",
            timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, noSpeechMessage]);
        speak(noSpeechMessage.text, () => {
            if(speechRecSupported && !isListeningRef.current) startListening();
        });
      }
      setIsAgentThinking(false); // Ensure thinking is false if transcript is empty
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: finalTranscript,
      timestamp: new Date(),
    };
    setChatHistory(prev => [...prev, userMessage]);
    setIsAgentThinking(true);

    try {
      const agentResponsePayload = await getAgentResponse(finalTranscript, products, faqs, agentContext);
      const messageToSpeak = onAgentAction(agentResponsePayload) || DEFAULT_CONCIERGE_ERROR_MESSAGE; 

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: messageToSpeak,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, agentMessage]);

      // Update context if a product recommendation was made
      if (agentResponsePayload.intent === 'GET_PRODUCT_RECOMMENDATION') {
        const GPRIntent = agentResponsePayload as GetProductRecommendationIntent;
        if (GPRIntent.suggestedProductIds && GPRIntent.suggestedProductIds.length > 0) {
          setAgentContext({ lastRecommendedProductIds: GPRIntent.suggestedProductIds });
        } 
        // If no specific products, current context (if any) persists for next turn.
        // Could also clear context here if desired: else { setAgentContext(undefined); }
      }


      speak(messageToSpeak, () => { 
        if(speechRecSupported && !isListeningRef.current) {
            startListening();
        }
      });
    } catch (error) {
      console.error("Error processing agent response:", error);
      const errorMessageText = error instanceof Error ? error.message : DEFAULT_CONCIERGE_ERROR_MESSAGE;
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString() + '_err_api',
        sender: 'agent',
        text: errorMessageText,
        timestamp: new Date(),
      };
      setChatHistory(prev => [...prev, errorMessage]);
      speak(errorMessageText, () => { 
         if(speechRecSupported && !isListeningRef.current) {
            startListening();
        }
      });
    } finally {
      setIsAgentThinking(false);
    }
  }, [products, faqs, onAgentAction, speak, speechRecognitionError, speechRecSupported, startListening, agentContext]);


  useEffect(() => {
    if (!isListening && transcript.trim()) {
      handleTranscriptSubmit(transcript);
      resetTranscript(); 
    } else if (!isListening && !transcript.trim() && speechRecognitionError && speechRecognitionError.includes("No speech")) {
      handleTranscriptSubmit(""); 
      resetTranscript();
    }
  }, [isListening, transcript, handleTranscriptSubmit, resetTranscript, speechRecognitionError]);


  const toggleMicButtonAction = () => {
    if (isSpeaking) cancelSpeech(); 

    if (isListening) {
      stopListening(); 
    } else {
      if (!speechRecSupported) {
         const errMessage: ChatMessage = {
            id: 'unsupported-mic-err-toggle',
            sender: 'agent',
            text: "Sorry, voice input is not supported on your current browser. Please try Chrome or Edge.",
            timestamp: new Date(),
        };
        setChatHistory(prev => [...prev, errMessage]);
        speak(errMessage.text);
        return;
      }
      resetTranscript(); 
      startListening();
    }
  };
  
  const handleClose = () => {
    if(isListening) stopListening();
    if(isSpeaking) cancelSpeech();
    resetTranscript();
    setInitialInteractionDone(false); // Reset for next open
    setAgentContext(undefined); // Clear context on close
    // setChatHistory([]); // Keep history for re-opening by default
    onClose();
  };

  if (!isOpen) return null;

  let micButtonText = speechRecSupported ? "Speak to Luca" : "Voice N/A";
  let MicButtonIcon = MicrophoneIcon;
  if (isListening) {
    micButtonText = "Stop";
    MicButtonIcon = StopIcon;
  } else if (isAgentThinking) {
    micButtonText = "Luca is thinking...";
  }


  return (
    <div 
      className="fixed bottom-24 right-6 w-full max-w-md h-[60vh] max-h-[520px] bg-[#f9f5ef] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40 border border-[#eadfca]" 
      role="dialog" 
      aria-modal="false" 
      aria-labelledby="voice-concierge-heading"
    >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#eadfca] bg-[#141414] text-[#f2e6d0]">
          <div>
            <h3 id="voice-concierge-heading" className="text-lg font-semibold tracking-wide">Luca Concierge</h3>
            <p className="text-xs text-[#c9b58f] mt-1">Your private shopping guide</p>
          </div>
          {isSpeaking && <VolumeUpIcon className="h-5 w-5 text-[#d6c19a] animate-pulse" aria-label="Concierge speaking" />}
          <button onClick={handleClose} className="text-[#d6c19a] hover:text-white transition-colors" aria-label="Close concierge window">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Chat Body */}
        <div ref={chatBodyRef} className="flex-grow p-4 space-y-3 overflow-y-auto bg-[#f9f5ef] custom-scrollbar" aria-live="polite" aria-atomic="false">
          <div className="bg-white border border-[#eadfca] rounded-xl p-3 text-xs text-[#6c5f47] leading-relaxed">
            <p className="font-semibold text-[#4a3f2f]">How to use Luca</p>
            <ul className="mt-2 space-y-1">
              <li>• Tap <span className="font-semibold">Speak to Luca</span> and say what you want.</li>
              <li>• Try: “Recommend a summer dress” or “Add the black dress to cart.”</li>
              <li>• Ask: “Where is my order?” or “What is your return policy?”</li>
            </ul>
          </div>
          {chatHistory.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[85%]`}>
                {msg.sender === 'agent' && <BotIcon className="h-7 w-7 text-[#bda77f] bg-[#f5efe4] rounded-full p-1 shrink-0" />}
                 <div
                  className={`p-2.5 rounded-lg shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-[#1a1a1a] text-[#f2e6d0] rounded-br-none' 
                      : 'bg-white text-[#3b3327] rounded-bl-none border border-[#eadfca]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                   <span className="text-xs opacity-70 mt-1 block text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                 {msg.sender === 'user' && <UserIcon className="h-7 w-7 text-[#6c5f47] bg-[#f5efe4] rounded-full p-1 shrink-0" />}
              </div>
            </div>
          ))}
          {isListening && interimTranscript && (
             <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="p-2.5 rounded-lg bg-[#f5efe4] text-[#6c5f47] border border-[#eadfca] rounded-br-none italic shadow-sm">
                        <p className="text-sm">{interimTranscript}...</p>
                    </div>
                    <UserIcon className="h-7 w-7 text-[#6c5f47] bg-[#f5efe4] rounded-full p-1 shrink-0" />
                </div>
            </div>
          )}
          {isAgentThinking && (
            <div className="flex justify-start">
               <div className="flex items-start gap-2">
                <BotIcon className="h-7 w-7 text-[#bda77f] bg-[#f5efe4] rounded-full p-1 shrink-0" />
                <div className="p-2.5 rounded-lg bg-white text-[#3b3327] rounded-bl-none shadow-sm border border-[#eadfca]">
                  <p className="text-sm italic">Luca is preparing your response...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-[#eadfca] bg-[#f5efe4]">
          {speechRecognitionError && !speechRecognitionError.includes("No speech") && !speechRecognitionError.includes("audio-capture") && ( 
            <p className="text-red-500 text-xs mb-1 text-center" role="alert">{speechRecognitionError}</p>
          )}
          {speechRecognitionError && speechRecognitionError.includes("audio-capture") && (
             <p className="text-red-500 text-xs mb-1 text-center" role="alert">Microphone not available. Check connection/permissions.</p>
          )}
          {!speechRecSupported && (
             <p className="text-red-500 text-xs mb-1 text-center" role="alert">
                Voice input not supported. Try Chrome/Edge.
             </p>
          )}
          <button
            onClick={toggleMicButtonAction}
            disabled={isAgentThinking || !speechRecSupported} 
            className={`w-full flex items-center justify-center py-2.5 px-4 rounded-md font-semibold transition-all duration-200
              ${isListening ? 'bg-[#8b2c2c] hover:bg-[#7a2323] text-white' : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#f2e6d0]'}
              ${isAgentThinking || !speechRecSupported ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md'}`}
            aria-label={isListening ? "Stop listening" : (speechRecSupported ? "Start listening" : "Voice input not available")}
          >
            <MicButtonIcon className="h-5 w-5 mr-2" />
            <span>{micButtonText}</span>
          </button>
        </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5efe4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d6c19a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bda77f;
        }
      `}</style>
    </div>
  );
};

export default ChatAgentUI;
