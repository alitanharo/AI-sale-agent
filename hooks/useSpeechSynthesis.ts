
import React, { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string, onEnd?: () => void) => void;
  cancelSpeech: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store onEnd callback in a ref to avoid stale closures in utterance event handlers
  const onEndCallbackRef = React.useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if ('speechSynthesis' in window && typeof window.speechSynthesis === 'object' && window.speechSynthesis !== null) {
      setIsSupported(true);
      // Pre-load voices (optional, can improve first-time speech)
      // Check if getVoices is available before calling
      if (typeof window.speechSynthesis.getVoices === 'function') {
         window.speechSynthesis.getVoices(); 
      }
    } else {
      setIsSupported(false);
      setError('Speech synthesis is not supported in this browser.');
    }

    // Cleanup: cancel any ongoing speech if component unmounts
    return () => {
      if (isSupported && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]); // Added isSupported to dependency array

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!isSupported || !text.trim() || !window.speechSynthesis) return;

    // Cancel any currently speaking utterance before starting a new one
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    onEndCallbackRef.current = onEnd;

    const utterance = new SpeechSynthesisUtterance(text);
    // Optionally configure voice, rate, pitch, etc.
    // const voices = window.speechSynthesis.getVoices();
    // utterance.voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Female')) || voices[0];
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
        onEndCallbackRef.current = undefined; // Clear after calling
      }
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('Speech synthesis error:', event.error);
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
       if (onEndCallbackRef.current) { // Also call onEnd on error to allow cleanup
        onEndCallbackRef.current();
        onEndCallbackRef.current = undefined;
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const cancelSpeech = useCallback(() => {
    if (isSupported && window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false); // Manually set as onend might not fire immediately or consistently
    }
  }, [isSupported]);

  return { speak, cancelSpeech, isSpeaking, isSupported, error };
};
