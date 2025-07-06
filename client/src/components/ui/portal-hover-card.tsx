import { createPortal } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface PortalHoverCardProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function PortalHoverCard({ children, content, className }: PortalHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.right + 10, // Position to the right of the trigger
        y: rect.top + (rect.height / 2) - 80 // Center vertically
      });
    }
    
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300); // 300ms delay before hiding
  };

  const handleContentMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleContentMouseLeave = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full"
      >
        {children}
      </div>
      {isOpen && createPortal(
        <div
          className={`fixed z-[9999] w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-2xl backdrop-blur-sm ${className || ''}`}
          style={{
            left: position.x,
            top: position.y,
            pointerEvents: 'auto'
          }}
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleContentMouseLeave}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}