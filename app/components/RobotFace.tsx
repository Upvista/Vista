'use client';

import { useEffect, useRef, useState } from 'react';

interface RobotFaceProps {
  emotion: 'neutral' | 'happy' | 'sad' | 'surprised' | 'excited' | 'sleepy' | 'angry' | 'confused' | 'love' | 'wink' | 'listening' | 'thinking' | 'talking';
  isActive?: boolean;
  onFaceClick?: () => void;
  autoAnimate?: boolean;
}

const AUTO_EMOTIONS: Array<'happy' | 'sad' | 'surprised' | 'excited' | 'sleepy' | 'confused' | 'love' | 'wink'> = [
  'happy', 'sad', 'surprised', 'excited', 'sleepy', 'confused', 'love', 'wink'
];

export default function RobotFace({ emotion, isActive = false, onFaceClick, autoAnimate = false }: RobotFaceProps) {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentAutoEmotion, setCurrentAutoEmotion] = useState<string | null>(null);

  // Eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || emotion !== 'neutral' || !isActive) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * 0.15;
      const deltaY = (e.clientY - centerY) * 0.15;
      
      const maxMove = 8;
      setEyePosition({
        x: Math.max(-maxMove, Math.min(maxMove, deltaX)),
        y: Math.max(-maxMove, Math.min(maxMove, deltaY)),
      });
    };

    if (emotion === 'neutral' && isActive) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    } else {
      setEyePosition({ x: 0, y: 0 });
    }
  }, [emotion, isActive]);

  // Auto blinking
  useEffect(() => {
    if (emotion !== 'neutral' || !isActive || !autoAnimate) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [emotion, isActive, autoAnimate]);

  // Auto emotion animation
  useEffect(() => {
    if (!autoAnimate || !isActive) return;
    
    // Don't auto-animate if user is interacting (listening, thinking, talking)
    if (emotion === 'listening' || emotion === 'thinking' || emotion === 'talking') {
      return;
    }

    const autoEmotionInterval = setInterval(() => {
      // Only show auto emotions when in neutral state
      if (emotion === 'neutral') {
        const randomEmotion = AUTO_EMOTIONS[Math.floor(Math.random() * AUTO_EMOTIONS.length)];
        setCurrentAutoEmotion(randomEmotion);
        
        // Show emotion for 2-3 seconds
        setTimeout(() => {
          setCurrentAutoEmotion(null);
        }, 2000 + Math.random() * 1000);
      }
    }, 4000 + Math.random() * 3000); // Random interval between 4-7 seconds

    return () => clearInterval(autoEmotionInterval);
  }, [emotion, isActive, autoAnimate]);

  // Get emotion class - prioritize user emotion over auto emotion
  const getEmotionClass = () => {
    if (!isActive) return '';
    
    // User emotions take priority
    if (emotion === 'listening' || emotion === 'thinking' || emotion === 'talking') {
      switch (emotion) {
        case 'listening':
          return 'listening';
        case 'thinking':
          return 'thinking';
        case 'talking':
          return 'talking';
        default:
          return '';
      }
    }
    
    // Show auto emotion if active
    if (currentAutoEmotion) {
      return currentAutoEmotion;
    }
    
    // Otherwise show user emotion
    switch (emotion) {
      case 'happy':
        return 'happy';
      case 'sad':
        return 'sad';
      case 'surprised':
        return 'surprised';
      case 'excited':
        return 'excited';
      case 'sleepy':
        return 'sleepy';
      case 'angry':
        return 'angry';
      case 'confused':
        return 'confused';
      case 'love':
        return 'love';
      case 'wink':
        return 'wink';
      default:
        return '';
    }
  };

  const getEyeColor = () => {
    if (emotion === 'angry' || currentAutoEmotion === 'angry') return '#ff0000';
    if (emotion === 'love' || currentAutoEmotion === 'love') return '#ff0080';
    return '#00ffff';
  };

  const shouldShowEyeAnimation = () => {
    // Show animation for auto emotions or user emotions (except listening/thinking/talking)
    if (currentAutoEmotion) return true;
    if (emotion === 'listening' || emotion === 'thinking' || emotion === 'talking') return false;
    return emotion !== 'neutral';
  };

  return (
    <div className="robot-container">
      <div 
        className={`robot-face ${getEmotionClass()}`} 
        ref={containerRef}
        onClick={onFaceClick}
        style={{ cursor: onFaceClick ? 'pointer' : 'default' }}
      >
        <div className="eyes-container">
          <div 
            className={`eye ${emotion === 'wink' || currentAutoEmotion === 'wink' ? 'wink' : ''} ${isBlinking ? 'blinking' : ''} ${shouldShowEyeAnimation() ? getEmotionClass() : ''}`}
            ref={leftEyeRef}
            style={{
              background: getEyeColor(),
              transform: emotion === 'neutral' && !currentAutoEmotion ? `translate(${eyePosition.x}px, ${eyePosition.y}px)` : undefined,
            }}
          />
          <div 
            className={`eye ${isBlinking ? 'blinking' : ''} ${shouldShowEyeAnimation() ? getEmotionClass() : ''}`}
            ref={rightEyeRef}
            style={{
              background: getEyeColor(),
              transform: emotion === 'neutral' && !currentAutoEmotion ? `translate(${eyePosition.x}px, ${eyePosition.y}px)` : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
