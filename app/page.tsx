'use client';

import { useState, useEffect, useRef } from 'react';
import RobotFace from './components/RobotFace';
import RobotFace2 from './components/RobotFace2';
import RobotFace3 from './components/RobotFace3';
import SettingsModal from './components/SettingsModal';
import { useVoiceInterface } from './hooks/useVoiceInterface';

type Emotion = 'neutral' | 'happy' | 'sad' | 'surprised' | 'excited' | 'sleepy' | 'angry' | 'confused' | 'love' | 'wink' | 'listening' | 'thinking' | 'talking' | 'smiling' | 'looking-left' | 'looking-right';

export default function Home() {
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [selectedFace, setSelectedFace] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const voiceInterfaceRef = useRef<any>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedFace = localStorage.getItem('selectedFace');
    if (savedFace) {
      setSelectedFace(parseInt(savedFace, 10));
    }
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save face preference to localStorage
  const handleFaceChange = (faceNumber: number) => {
    setSelectedFace(faceNumber);
    localStorage.setItem('selectedFace', faceNumber.toString());
  };

  const handleTranscript = async (text: string) => {
    lastActivityRef.current = Date.now(); // Update activity timestamp
    
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
          setEmotion('neutral');
        }, 3000);
      }

      // Speak the response
      if (voiceInterfaceRef.current?.speak) {
        voiceInterfaceRef.current.speak(aiResponse, () => {
          // After speaking, return to neutral
          setEmotion('neutral');
        });
      } else {
        // Fallback: use browser's speech synthesis directly
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;      // Slower for cute, gentle delivery
        utterance.pitch = 1.15;    // Higher pitch for cute, sweet sound
        utterance.volume = 0.85;    // Soft, gentle volume
        
        utterance.onstart = () => {
          setEmotion('talking');
        };
        
        utterance.onend = () => {
          setEmotion('neutral');
          handleStatusChange('idle');
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
    lastActivityRef.current = Date.now(); // Update activity timestamp
    
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

  const voiceInterface = useVoiceInterface(handleTranscript, handleStatusChange, selectedVoice);

  useEffect(() => {
    voiceInterfaceRef.current = {
      startListening: voiceInterface.startListening,
      stopListening: voiceInterface.stopListening,
      speak: voiceInterface.speak,
      updateVoice: voiceInterface.updateVoice,
    };
  }, [voiceInterface]);

  // Idle detection - show sleepy after 30 seconds of inactivity
  useEffect(() => {
    const checkIdle = () => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      const idleThreshold = 30000; // 30 seconds

      if (timeSinceLastActivity > idleThreshold && emotion === 'neutral') {
        setEmotion('sleepy');
      } else if (timeSinceLastActivity <= idleThreshold && emotion === 'sleepy') {
        setEmotion('neutral');
      }
    };

    idleTimerRef.current = setInterval(checkIdle, 5000); // Check every 5 seconds

    return () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, [emotion]);

  // Handle face click - show joy and start listening
  const handleFaceClick = (e?: React.MouseEvent) => {
    if (!voiceInterface.isSupported) {
      console.log('[Page] Voice interface not supported');
      return;
    }

    // Prevent default to ensure click event is properly handled on mobile
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    lastActivityRef.current = Date.now(); // Reset idle timer
    
    console.log('[Page] Face clicked, starting listening...');
    
    // Show happy emotion
    setEmotion('happy');
    
    // On mobile, start listening faster to maintain user gesture context
    const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
    const delay = isMobile ? 300 : 800;
    
    setTimeout(() => {
      setEmotion('listening');
      console.log('[Page] Calling startListening...');
      voiceInterface.startListening();
    }, delay);
  };

  const faceProps = {
    emotion,
    isActive: true,
    onFaceClick: handleFaceClick,
    onLongPress: () => setIsSettingsOpen(true),
    autoAnimate: true,
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const handleVoiceChange = (voiceName: string) => {
    console.log('[Page] Voice change requested:', voiceName);
    setSelectedVoice(voiceName);
    localStorage.setItem('selectedVoice', voiceName);
    // Force voice update in the hook
    if (voiceInterfaceRef.current?.updateVoice) {
      voiceInterfaceRef.current.updateVoice();
    }
  };

  return (
    <div className={`screen-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      {selectedFace === 1 && <RobotFace {...faceProps} />}
      {selectedFace === 2 && <RobotFace2 {...faceProps} />}
      {selectedFace === 3 && <RobotFace3 {...faceProps} />}
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedFace={selectedFace}
        onFaceChange={handleFaceChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        selectedVoice={selectedVoice}
        onVoiceChange={handleVoiceChange}
      />
    </div>
  );
}
