"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate } from "framer-motion";

interface Position {
  x: number;
  y: number;
}

interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  position?: Position;
  defaultPosition?: Position;
  isStatic?: boolean;
  duration?: number;
  lensColor?: string;
  ariaLabel?: string;
  className?: string;
}

export function Lens({
  children,
  zoomFactor = 1.3,
  lensSize = 170,
  isStatic = false,
  position = { x: 0, y: 0 },
  defaultPosition,
  duration = 0.1,
  lensColor = "black",
  ariaLabel = "Zoom Area",
  className,
}: LensProps) {
  if (zoomFactor < 1) {
    throw new Error("zoomFactor must be greater than 1");
  }
  if (lensSize <= 0) {
    throw new Error("lensSize must be greater than 0");
  }

  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState<Position>(position);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPosition = useMemo(() => {
    if (isStatic) return position;
    if (defaultPosition && !isHovering) return defaultPosition;
    return mousePosition;
  }, [isStatic, position, defaultPosition, isHovering, mousePosition]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") setIsHovering(false);
  }, []);

  const maskImage = useMotionTemplate`radial-gradient(circle ${lensSize / 2}px at ${currentPosition.x}px ${currentPosition.y}px, ${lensColor} 100%, transparent 100%)`;

  const lensContent = useMemo(() => {
    const { x, y } = currentPosition;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.58 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration }}
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          transformOrigin: `${x}px ${y}px`,
          zIndex: 50,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoomFactor})`,
            transformOrigin: `${x}px ${y}px`,
          }}
        >
          {children}
        </div>
      </motion.div>
    );
  }, [children, currentPosition, lensColor, lensSize, duration, maskImage, zoomFactor]);

  const shouldRenderStatic = isStatic || !!defaultPosition;

  return (
    <div
      ref={containerRef}
      className={`relative z-20 overflow-hidden rounded-xl ${className ?? ""}`.trim()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {children}
      {shouldRenderStatic ? (
        lensContent
      ) : (
        <AnimatePresence mode="popLayout">{isHovering && lensContent}</AnimatePresence>
      )}
    </div>
  );
}


