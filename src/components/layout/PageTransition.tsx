'use client';

import { useEffect, useState, ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade';
  duration?: number;
}

export default function PageTransition({
  children,
  className = '',
  direction = 'fade',
  duration = 200,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Start animation on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const getTransformStyle = () => {
    const transforms = {
      left: 'translateX(-20px)',
      right: 'translateX(20px)',
      up: 'translateY(-20px)',
      down: 'translateY(20px)',
      fade: 'translateY(0)',
    };

    return {
      transform: isVisible ? 'translate(0, 0)' : transforms[direction],
      opacity: isVisible ? 1 : 0,
      transition: `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`,
    };
  };

  return (
    <div className={className} style={getTransformStyle()}>
      {children}
    </div>
  );
}

// Hook for programmatic page transitions
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'in' | 'out'>('in');

  const startTransition = (direction: 'in' | 'out' = 'out') => {
    setTransitionDirection(direction);
    setIsTransitioning(true);
  };

  const endTransition = () => {
    setIsTransitioning(false);
  };

  return {
    isTransitioning,
    transitionDirection,
    startTransition,
    endTransition,
  };
}

// Animated list item component
interface AnimatedListItemProps {
  children: ReactNode;
  index: number;
  delay?: number;
  className?: string;
}

export function AnimatedListItem({
  children,
  index,
  delay = 50,
  className = '',
}: AnimatedListItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * delay);

    return () => clearTimeout(timer);
  }, [index, delay]);

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 300ms ease-out, transform 300ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}

// Animated card with scale effect
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AnimatedCard({ children, className = '', onClick }: AnimatedCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={className}
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 150ms ease-out',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  );
}

// Skeleton loader with pulse animation
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({
  className = '',
  width = '100%',
  height = 20,
  borderRadius = 8,
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white/10 ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
}

// Staggered animation container
interface StaggeredContainerProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggeredContainer({
  children,
  staggerDelay = 50,
  className = '',
}: StaggeredContainerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedListItem key={index} index={index} delay={staggerDelay}>
          {child}
        </AnimatedListItem>
      ))}
    </div>
  );
}
