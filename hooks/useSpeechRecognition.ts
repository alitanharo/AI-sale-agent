
import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionHook {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  isSupported: boolean;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      //setError('Speech recognition is not supported in this browser.');
      //setIsSupported(false);
      return;
    }
    setIsSupported(true);

    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;
    recognition.continuous = false; // Key change: stop automatically after pause
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscriptPart = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptPart += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }
      if (finalTranscriptPart) {
        setTranscript(prev => prev + finalTranscriptPart); // Append final part to existing final transcript for this session
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      let errorMessage = `Speech error: ${event.error}.`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = "Microphone access denied. Please enable microphone permissions in browser settings.";
      } else if (event.error === 'no-speech') {
        errorMessage = "No speech was detected. Please try speaking again.";
        // For no-speech, we don't necessarily set the global error that stops interaction,
        // as the user might just need to try again. The UI can show this.
      } else if (event.error === 'audio-capture') {
        errorMessage = "Microphone not available. Ensure it's connected and not in use by another app.";
      }
      setError(errorMessage);
      setIsListening(false); // Ensure listening stops on error
    };

    recognition.onend = () => {
      // Fired when speech recognition service has disconnected (e.g., after stop() or auto-stop if continuous=false)
      setIsListening(false);
      setInterimTranscript(''); // Clear interim transcript when fully stopped
    };
    
    // Optional: onspeechend can be used for UI cues if needed, but onend handles the state change.
    // recognition.onspeechend = () => {
    //   // User has stopped speaking.
    // };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort(); // Abort to stop immediately and discard results
      }
    };
  }, []); // Runs once on mount

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) { // Check ref for current state
        if(isListeningRef.current) console.warn("Already listening.");
        return;
    }
    try {
      setTranscript(''); // Clear previous full transcript for the new session
      setInterimTranscript('');
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e: any) {
      console.error("Error starting recognition:", e);
      setError(e.message || "Failed to start microphone. Check permissions and ensure no other tab is using it.");
      setIsListening(false);
    }
  }, []); // Dependencies are stable state setters

  const stopListening = useCallback(() => {
    // This is an explicit stop by user/system, distinct from auto-stop.
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop(); // Request to stop, onend will fire.
    }
    // Set isListening to false immediately for UI responsiveness, onend will confirm.
    setIsListening(false);
    setInterimTranscript(''); // Clear interim as well
  }, []); // Dependencies are stable state setters

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return { transcript, interimTranscript, isListening, startListening, stopListening, resetTranscript, error, isSupported };
};
