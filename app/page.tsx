'use client';

import { useState, useEffect, useRef } from 'react';
import RobotFace from './components/RobotFace';
import { useVoiceInterface } from './hooks/useVoiceInterface';

type Emotion = 'neutral' | 'happy' | 'sad' | 'surprised' | 'excited' | 'sleepy' | 'angry' | 'confused' | 'love' | 'wink' | 'listening' | 'thinking' | 'talking';

export default function Home() {
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const voiceInterfaceRef = useRef<any>(null);

  const handleTranscript = async (text: string) => {
    try {
      // Call backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      const aiResponse = data.response || "I'm sorry, I didn't understand that.";
      const detectedEmotion = data.emotion || 'neutral';

      // Set emotion based on AI response
      if (detectedEmotion && detectedEmotion !== 'neutral') {
        setEmotion(detectedEmotion as Emotion);
        setTimeout(() => {
          // After showing emotion, continue auto-animation
          setEmotion('neutral');
        }, 3000);
      }

      // Speak the response
      if (voiceInterfaceRef.current?.speak) {
        voiceInterfaceRef.current.speak(aiResponse, () => {
          // After speaking, return to neutral and continue auto-animation
          setEmotion('neutral');
        });
      } else {
        // Fallback: use browser's speech synthesis directly
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
          setEmotion('talking');
        };
        
        utterance.onend = () => {
          setEmotion('neutral');
        };
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error:', error);
      setEmotion('sad');
      setTimeout(() => setEmotion('neutral'), 2000);
    }
  };

  const handleStatusChange = (newStatus: 'idle' | 'listening' | 'processing' | 'speaking') => {
    // Map status to emotion
    switch (newStatus) {
      case 'listening':
        setEmotion('listening');
        break;
      case 'processing':
        setEmotion('thinking');
        break;
      case 'speaking':
        setEmotion('talking');
        break;
      case 'idle':
        setEmotion('neutral');
        break;
    }
  };

  const voiceInterface = useVoiceInterface(handleTranscript, handleStatusChange);

  useEffect(() => {
    voiceInterfaceRef.current = {
      startListening: voiceInterface.startListening,
      stopListening: voiceInterface.stopListening,
      speak: voiceInterface.speak,
    };
  }, [voiceInterface]);

  // Handle face click - show joy and start listening
  const handleFaceClick = () => {
    if (!voiceInterface.isSupported) {
      return;
    }

    // Show joy emotion
    setEmotion('happy');
    
    // Start listening after a short delay
    setTimeout(() => {
      setEmotion('listening');
      voiceInterface.startListening();
    }, 800);
  };

  return (
    <div className="screen-container">
      <RobotFace 
        emotion={emotion} 
        isActive={true}
        onFaceClick={handleFaceClick}
        autoAnimate={true}
      />
    </div>
  );
}
