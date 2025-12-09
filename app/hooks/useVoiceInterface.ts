'use client';

import { useState, useEffect, useRef } from 'react';

export function useVoiceInterface(
  onTranscript: (text: string) => void,
  onStatusChange: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void
) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const hotwordDetectedRef = useRef(false);
  const continuousListeningRef = useRef(false);
  const isStartingRef = useRef(false);

  useEffect(() => {
    // Check for Speech Recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Enable continuous listening for hotword
      recognitionRef.current.interimResults = true; // Get interim results for hotword detection
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
        isStartingRef.current = false;
        if (!hotwordDetectedRef.current) {
          // Only show "listening" status after hotword is detected
        }
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Hotword detection: "hey vista" (exact phrase only, nothing else)
        const allText = (finalTranscript + interimTranscript).toLowerCase().trim();
        
        // Clean up common punctuation and normalize whitespace
        const normalizedText = allText.replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();
        
        // Only detect "hey vista" if it's the ONLY thing said (exact match)
        const isOnlyHeyVista = normalizedText === 'hey vista';
        
        // Only trigger if "hey vista" is the ONLY text (no other words before or after)
        if (!hotwordDetectedRef.current && isOnlyHeyVista) {
          hotwordDetectedRef.current = true;
          continuousListeningRef.current = true;
          onStatusChange('listening'); // Show listening status after hotword with purplish glow
          return; // Don't process anything else, just wait for next command
        }

        // Only process commands after hotword is detected (and it's NOT "hey vista" again)
        if (hotwordDetectedRef.current && finalTranscript.trim() && !isOnlyHeyVista) {
          // Remove "hey vista" from the beginning if present
          let cleanedText = finalTranscript.trim().replace(/^hey vista[\s,.:!?]*/gi, '').trim();
          if (cleanedText) {
            onTranscript(cleanedText);
            onStatusChange('processing');
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setError(event.error);
        isStartingRef.current = false;
        
        // Don't reset on "no-speech" error during continuous listening
        if (event.error === 'no-speech' && continuousListeningRef.current) {
          // Keep listening for hotword
          return;
        }
        
        if (event.error === 'aborted') {
          // Recognition was stopped intentionally, don't reset
          return;
        }
        
        // For other errors, reset if not in continuous mode
        if (!continuousListeningRef.current) {
          setIsListening(false);
          hotwordDetectedRef.current = false;
          onStatusChange('idle');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        isStartingRef.current = false;
        
        // Auto-restart if continuous listening is enabled (for hotword detection)
        if (continuousListeningRef.current && !hotwordDetectedRef.current) {
          // Restart hotword detection after a delay
          setTimeout(() => {
            if (recognitionRef.current && !isStartingRef.current) {
              try {
                isStartingRef.current = true;
                recognitionRef.current.start();
              } catch (err: any) {
                isStartingRef.current = false;
                // Ignore "already started" errors
                if (!err.message?.includes('already started')) {
                  console.log('Error restarting hotword detection:', err);
                }
              }
            }
          }, 1000);
        }
      };
    }

    // Text-to-Speech
    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [onTranscript, onStatusChange]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    // Stop any existing recognition first
    if (isListening || isStartingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    
    // Wait a bit before starting new recognition
    setTimeout(() => {
      if (recognitionRef.current && !isStartingRef.current) {
        try {
          isStartingRef.current = true;
          hotwordDetectedRef.current = false;
          continuousListeningRef.current = false;
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.start();
        } catch (err: any) {
          isStartingRef.current = false;
          // Ignore "already started" errors
          if (!err.message?.includes('already started')) {
            console.error('Error starting recognition:', err);
          }
        }
      }
    }, 300);
  };

  const startContinuousListening = () => {
    if (!recognitionRef.current) return;
    
    // Stop any existing recognition first
    if (isListening || isStartingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    
    // Wait a bit before starting continuous recognition
    setTimeout(() => {
      if (recognitionRef.current && !isStartingRef.current) {
        try {
          isStartingRef.current = true;
          hotwordDetectedRef.current = false;
          continuousListeningRef.current = true;
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.start();
        } catch (err: any) {
          isStartingRef.current = false;
          // Ignore "already started" errors
          if (!err.message?.includes('already started')) {
            console.error('Error starting continuous recognition:', err);
          }
        }
      }
    }, 300);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        isStartingRef.current = false;
        hotwordDetectedRef.current = false;
        continuousListeningRef.current = false;
      } catch (e) {
        // Ignore errors
      }
    }
  };

  const speak = (text: string, onEnd?: () => void) => {
    if (!synthesisRef.current) return;

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      onStatusChange('speaking');
      // Pause listening while speaking
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors
        }
      }
    };

    utterance.onend = () => {
      onStatusChange('idle');
      
      // Reset hotword detection and resume continuous listening
      hotwordDetectedRef.current = false;
      
      // Restart continuous listening for hotword detection
      if (continuousListeningRef.current) {
        setTimeout(() => {
          startContinuousListening();
        }, 500);
      }
      
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      onStatusChange('idle');
    };

    synthesisRef.current.speak(utterance);
  };

  return {
    startListening,
    startContinuousListening,
    stopListening,
    speak,
    isSupported,
    isListening,
    error,
  };
}
