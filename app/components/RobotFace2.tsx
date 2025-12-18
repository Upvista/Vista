'use client';

import { useEffect, useRef, useState } from 'react';

interface RobotFaceProps {
  emotion: 'neutral' | 'happy' | 'sad' | 'surprised' | 'excited' | 'sleepy' | 'angry' | 'confused' | 'love' | 'wink' | 'listening' | 'thinking' | 'talking' | 'smiling' | 'looking-left' | 'looking-right';
  isActive?: boolean;
  onFaceClick?: () => void;
  onLongPress?: () => void;
  autoAnimate?: boolean;
}

const AUTO_EMOTIONS: Array<'happy' | 'sad' | 'surprised' | 'excited' | 'sleepy' | 'confused' | 'love' | 'wink' | 'smiling'> = [
  'happy', 'sad', 'surprised', 'excited', 'sleepy', 'confused', 'love', 'wink', 'smiling'
];

export default function RobotFace2({ emotion, isActive = false, onFaceClick, onLongPress, autoAnimate = false }: RobotFaceProps) {
  const leftEyeRef = useRef<HTMLDivElement>(null);
  const rightEyeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentAutoEmotion, setCurrentAutoEmotion] = useState<string | null>(null);
  const [lookDirection, setLookDirection] = useState<'center' | 'left' | 'right'>('center');
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);

  // Eye tracking and random looking around
  useEffect(() => {
    if (!containerRef.current || !isActive || !autoAnimate) return;
    
    if (currentAutoEmotion !== null && 
        emotion !== 'neutral' && 
        emotion !== 'listening' && 
        emotion !== 'thinking' && 
        emotion !== 'talking') {
      return;
    }
    
    const lookInterval = setInterval(() => {
      if (lookDirection !== 'center') return;
      
      const directions: Array<'left' | 'right' | 'center'> = ['left', 'right', 'center'];
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      setLookDirection(randomDir);
      
      setTimeout(() => {
        setLookDirection('center');
      }, 1500 + Math.random() * 1000);
    }, 3000 + Math.random() * 3000);

    return () => clearInterval(lookInterval);
  }, [emotion, isActive, autoAnimate, currentAutoEmotion, lookDirection]);

  // Mouse/touch tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isActive) return;
      
      const allowTracking = emotion === 'neutral' || 
                           emotion === 'listening' || 
                           emotion === 'thinking' || 
                           emotion === 'talking';
      
      if (!allowTracking || currentAutoEmotion) return;
      
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

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !isActive || e.touches.length === 0) return;
      
      const allowTracking = emotion === 'neutral' || 
                           emotion === 'listening' || 
                           emotion === 'thinking' || 
                           emotion === 'talking';
      
      if (!allowTracking || currentAutoEmotion) return;
      
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (touch.clientX - centerX) * 0.15;
      const deltaY = (touch.clientY - centerY) * 0.15;
      
      const maxMove = 8;
      setEyePosition({
        x: Math.max(-maxMove, Math.min(maxMove, deltaX)),
        y: Math.max(-maxMove, Math.min(maxMove, deltaY)),
      });
    };

    const allowTracking = (emotion === 'neutral' || 
                          emotion === 'listening' || 
                          emotion === 'thinking' || 
                          emotion === 'talking') && 
                          isActive && 
                          lookDirection === 'center' &&
                          !currentAutoEmotion;
    
    if (allowTracking) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
      };
    } else {
      if (lookDirection === 'left') {
        setEyePosition({ x: -10, y: 0 });
      } else if (lookDirection === 'right') {
        setEyePosition({ x: 10, y: 0 });
      } else if (!currentAutoEmotion && emotion !== 'listening' && emotion !== 'thinking' && emotion !== 'talking') {
        setEyePosition({ x: 0, y: 0 });
      }
    }
  }, [emotion, isActive, lookDirection, currentAutoEmotion]);

  // Auto blinking
  useEffect(() => {
    if (!isActive || !autoAnimate) return;
    
    const shouldSkipBlink = currentAutoEmotion !== null && 
                           emotion !== 'listening' && 
                           emotion !== 'thinking' && 
                           emotion !== 'talking';
    
    if (shouldSkipBlink) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 2000);

    return () => clearInterval(blinkInterval);
  }, [emotion, isActive, autoAnimate, currentAutoEmotion]);

  // Auto emotion animation
  useEffect(() => {
    if (!autoAnimate || !isActive) return;

    const autoEmotionInterval = setInterval(() => {
      if (currentAutoEmotion) return;
      
      const randomEmotion = AUTO_EMOTIONS[Math.floor(Math.random() * AUTO_EMOTIONS.length)];
      setCurrentAutoEmotion(randomEmotion);
      
      const emotionDuration = 2000 + Math.random() * 2000;
      setTimeout(() => {
        setCurrentAutoEmotion(null);
      }, emotionDuration);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(autoEmotionInterval);
  }, [emotion, isActive, autoAnimate, currentAutoEmotion]);

  const getEmotionClass = () => {
    if (!isActive) return '';
    
    if (currentAutoEmotion) {
      return currentAutoEmotion;
    }
    
    if (emotion === 'listening' || emotion === 'thinking' || emotion === 'talking') {
      return '';
    }
    
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
      case 'smiling':
        return 'smiling';
      default:
        return '';
    }
  };

  const shouldShowEyeAnimation = () => {
    if (currentAutoEmotion) return true;
    if (emotion === 'listening' || emotion === 'thinking' || emotion === 'talking') return false;
    return emotion !== 'neutral';
  };

  const getEyeTransform = () => {
    if (!isActive) return undefined;
    
    if (currentAutoEmotion && 
        emotion !== 'listening' && 
        emotion !== 'thinking' && 
        emotion !== 'talking') {
      return undefined;
    }
    
    const allowMovement = emotion === 'neutral' || 
                         emotion === 'listening' || 
                         emotion === 'thinking' || 
                         emotion === 'talking';
    
    if (!allowMovement) return undefined;
    
    if (lookDirection === 'left') {
      return 'translate(-10px, 0px)';
    } else if (lookDirection === 'right') {
      return 'translate(10px, 0px)';
    } else if (lookDirection === 'center') {
      return `translate(${eyePosition.x}px, ${eyePosition.y}px)`;
    }
    
    return `translate(${eyePosition.x}px, ${eyePosition.y}px)`;
  };

  const getReflectionTransform = () => {
    if (!isActive) return undefined;
    
    if (currentAutoEmotion && 
        emotion !== 'listening' && 
        emotion !== 'thinking' && 
        emotion !== 'talking') {
      return undefined;
    }
    
    const allowMovement = emotion === 'neutral' || 
                         emotion === 'listening' || 
                         emotion === 'thinking' || 
                         emotion === 'talking';
    
    if (!allowMovement) return undefined;
    
    const reflectionMoveX = eyePosition.x * 0.3;
    const reflectionMoveY = eyePosition.y * 0.3;
    const maxReflectionMove = 6;
    
    if (lookDirection === 'left') {
      return 'translate(-4px, 0px)';
    } else if (lookDirection === 'right') {
      return 'translate(4px, 0px)';
    } else if (lookDirection === 'center') {
      return `translate(${Math.max(-maxReflectionMove, Math.min(maxReflectionMove, reflectionMoveX))}px, ${Math.max(-maxReflectionMove, Math.min(maxReflectionMove, reflectionMoveY))}px)`;
    }
    
    return `translate(${Math.max(-maxReflectionMove, Math.min(maxReflectionMove, reflectionMoveX))}px, ${Math.max(-maxReflectionMove, Math.min(maxReflectionMove, reflectionMoveY))}px)`;
  };

  const getMouthShape = () => {
    if (emotion === 'talking') return 'talking';
    if (currentAutoEmotion === 'happy' || emotion === 'happy' || currentAutoEmotion === 'excited' || emotion === 'excited' || currentAutoEmotion === 'smiling' || emotion === 'smiling') return 'happy';
    if (currentAutoEmotion === 'sad' || emotion === 'sad') return 'sad';
    if (currentAutoEmotion === 'surprised' || emotion === 'surprised') return 'surprised';
    if (currentAutoEmotion === 'angry' || emotion === 'angry') return 'angry';
    if (currentAutoEmotion === 'love' || emotion === 'love') return 'love';
    if (currentAutoEmotion === 'confused' || emotion === 'confused') return 'confused';
    if (currentAutoEmotion === 'sleepy' || emotion === 'sleepy') return 'sleepy';
    return 'neutral';
  };

  // Long press detection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onLongPress) return;
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      if (!longPressTriggeredRef.current) {
        longPressTriggeredRef.current = true;
        onLongPress();
      }
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onLongPress) return;
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      if (!longPressTriggeredRef.current) {
        longPressTriggeredRef.current = true;
        e.preventDefault();
        onLongPress();
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="robot-container">
      <div 
        className={`robot-face face-2 anime-style ${getEmotionClass()} ${emotion === 'listening' ? 'listening' : ''} ${emotion === 'thinking' ? 'thinking' : ''} ${emotion === 'talking' ? 'talking' : ''}`}
        ref={containerRef}
        onClick={onFaceClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: onFaceClick ? 'pointer' : 'default' }}
      >
        <div className="eyes-container face-2-eyes">
          <div 
            className={`anime-eye face-2-eye ${emotion === 'wink' || currentAutoEmotion === 'wink' ? 'wink' : ''} ${isBlinking ? 'blinking' : ''} ${shouldShowEyeAnimation() ? getEmotionClass() : ''}`}
            ref={leftEyeRef}
            style={{
              transform: getEyeTransform(),
            }}
          >
            <div className="face-2-eye-main">
              <div className="face-2-reflection-crescent" style={{ transform: getReflectionTransform() }}></div>
              <div className="face-2-reflection-circle" style={{ transform: getReflectionTransform() }}></div>
            </div>
            <div className="face-2-blush"></div>
          </div>
          <div 
            className={`anime-eye face-2-eye ${isBlinking ? 'blinking' : ''} ${shouldShowEyeAnimation() ? getEmotionClass() : ''}`}
            ref={rightEyeRef}
            style={{
              transform: getEyeTransform(),
            }}
          >
            <div className="face-2-eye-main">
              <div className="face-2-reflection-crescent" style={{ transform: getReflectionTransform() }}></div>
              <div className="face-2-reflection-circle" style={{ transform: getReflectionTransform() }}></div>
            </div>
            <div className="face-2-blush"></div>
          </div>
        </div>
        <div className={`anime-mouth face-2-mouth ${getMouthShape()}`}>
          <svg viewBox="0 0 100 60" className="mouth-svg">
            {getMouthShape() === 'happy' && (
              <path d="M 25 30 Q 35 38, 45 30 Q 55 38, 65 30" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
            )}
            {getMouthShape() === 'sad' && (
              <path d="M 25 35 Q 35 27, 45 35 Q 55 27, 65 35" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
            )}
            {getMouthShape() === 'surprised' && (
              <ellipse cx="45" cy="30" rx="6" ry="10" stroke="currentColor" strokeWidth="3" fill="currentColor" opacity="0.2"/>
            )}
            {getMouthShape() === 'angry' && (
              <path d="M 25 33 Q 35 28, 45 33 Q 55 28, 65 33" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
            )}
            {getMouthShape() === 'love' && (
              <path d="M 25 30 Q 35 25, 45 30 Q 55 25, 65 30" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
            )}
            {getMouthShape() === 'confused' && (
              <path d="M 30 30 Q 40 33, 50 30 Q 60 33, 70 30" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
            )}
            {getMouthShape() === 'sleepy' && (
              <path d="M 28 33 Q 40 35, 52 33 Q 60 35, 68 33" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            )}
            {getMouthShape() === 'talking' && (
              <>
                <ellipse cx="45" cy="30" rx="7" ry="9" stroke="currentColor" strokeWidth="3" fill="currentColor" opacity="0.25" className="talking-mouth-1"/>
                <ellipse cx="45" cy="30" rx="4" ry="6" stroke="currentColor" strokeWidth="2.5" fill="currentColor" opacity="0.4" className="talking-mouth-2"/>
              </>
            )}
            {getMouthShape() === 'neutral' && (
              <path d="M 20 28 Q 25 23, 30 28 Q 35 33, 40 28 Q 45 23, 50 28" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
