
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product, FaqItem, ChatMessage, GeminiAgentResponse, GetProductRecommendationIntent } from '../types';
import { getAgentResponse } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon'; 
import { CloseIcon } from './icons/CloseIcon';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';
import { VolumeUpIcon } from './icons/VolumeUpIcon';
import { DEFAULT_GEMINI_ERROR_MESSAGE } from '../constants';


interface ChatAgentUIProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  faqs: FaqItem[];
  onAgentAction: (response: GeminiAgentResponse) => string; 
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
        const welcomeMsgText = "Hi! I'm Nova, your shopping assistant. How can I help you today?";
        
        const welcomeMessageExists = chatHistory.some(msg => msg.id === 'nova-initial-welcome');
        if (!welcomeMessageExists) {
             setChatHistory(prev => [{ id: 'nova-initial-welcome', sender: 'agent', text: welcomeMsgText, timestamp: new Date() }, ...prev.filter(m => m.id !== 'nova-initial-welcome')]);
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
      const messageToSpeak = onAgentAction(agentResponsePayload) || DEFAULT_GEMINI_ERROR_MESSAGE; 

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
      const errorMessageText = error instanceof Error ? error.message : DEFAULT_GEMINI_ERROR_MESSAGE;
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

  let micButtonText = speechRecSupported ? "Speak" : "Voice N/A";
  let MicButtonIcon = MicrophoneIcon;
  if (isListening) {
    micButtonText = "Stop";
    MicButtonIcon = StopIcon;
  } else if (isAgentThinking) {
    micButtonText = "Nova is thinking...";
  }


  return (
    <div 
      className="fixed bottom-24 right-6 w-full max-w-md h-[60vh] max-h-[480px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden z-40 border border-slate-300" 
      role="dialog" 
      aria-modal="false" 
      aria-labelledby="voice-assistant-heading"
    >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-slate-700 text-white">
          <h3 id="voice-assistant-heading" className="text-lg font-semibold">Nova Assistant</h3>
          {isSpeaking && <VolumeUpIcon className="h-5 w-5 text-sky-300 animate-pulse" aria-label="Agent speaking" />}
          <button onClick={handleClose} className="text-gray-300 hover:text-white transition-colors" aria-label="Close voice assistant">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Chat Body */}
        <div ref={chatBodyRef} className="flex-grow p-4 space-y-3 overflow-y-auto bg-slate-50 custom-scrollbar" aria-live="polite" aria-atomic="false">
          {chatHistory.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-2 max-w-[85%]`}>
                {msg.sender === 'agent' && <BotIcon className="h-7 w-7 text-sky-500 bg-sky-100 rounded-full p-1 shrink-0" />}
                 <div
                  className={`p-2.5 rounded-lg shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-sky-500 text-white rounded-br-none' 
                      : 'bg-gray-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                   <span className="text-xs opacity-70 mt-1 block text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                 {msg.sender === 'user' && <UserIcon className="h-7 w-7 text-slate-500 bg-slate-100 rounded-full p-1 shrink-0" />}
              </div>
            </div>
          ))}
          {isListening && interimTranscript && (
             <div className="flex justify-end">
                <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="p-2.5 rounded-lg bg-sky-100 text-sky-700 border border-sky-200 rounded-br-none italic shadow-sm">
                        <p className="text-sm">{interimTranscript}...</p>
                    </div>
                    <UserIcon className="h-7 w-7 text-slate-500 bg-slate-100 rounded-full p-1 shrink-0" />
                </div>
            </div>
          )}
          {isAgentThinking && (
            <div className="flex justify-start">
               <div className="flex items-start gap-2">
                <BotIcon className="h-7 w-7 text-sky-500 bg-sky-100 rounded-full p-1 shrink-0" />
                <div className="p-2.5 rounded-lg bg-gray-200 text-slate-800 rounded-bl-none shadow-sm">
                  <p className="text-sm italic">Nova is thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 bg-slate-100">
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
            className={`w-full flex items-center justify-center py-2.5 px-4 rounded-md font-semibold text-white transition-all duration-200
              ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-sky-500 hover:bg-sky-600'}
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
          background: #f1f5f9; /* bg-slate-100 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8; /* bg-slate-400 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b; /* bg-slate-500 */
        }
      `}</style>
    </div>
  );
};

export default ChatAgentUI;
