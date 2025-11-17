import { useEffect, useState } from 'react';

interface ConfettiProps {
  show: boolean;
  duration?: number;
}

export default function Confetti({ show, duration = 3000 }: ConfettiProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  // Generate random confetti pieces
  const confettiPieces = Array.from({ length: 50 }, (_, i) => {
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#00CED1', '#FF1493', '#32CD32'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomLeft = Math.random() * 100;
    const randomDelay = Math.random() * 0.5;
    const randomDuration = 2 + Math.random() * 2;

    return (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${randomLeft}%`,
          backgroundColor: randomColor,
          animationDelay: `${randomDelay}s`,
          animationDuration: `${randomDuration}s`,
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces}
      <style>{`
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          opacity: 1;
          animation: confetti-fall linear forwards;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .confetti-piece {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
