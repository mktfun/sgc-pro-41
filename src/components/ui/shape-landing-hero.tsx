import React from 'react';

interface ShapeLandingHeroProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Componente placeholder para resolver erros de build
 * Este componente foi criado para resolver erros de tipagem relacionados ao framer-motion
 */
export function ShapeLandingHero({ className = "", children }: ShapeLandingHeroProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

export default ShapeLandingHero;