import confetti from 'canvas-confetti';

/**
 * High-impact festive confetti cannon explosions tailored for Teacher's Birthday
 */
export const triggerBirthdayBurst = () => {
  // Center explosive pop
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.58, x: 0.5 },
    colors: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#ec4899', '#facc15', '#a855f7'],
    ticks: 280,
    gravity: 0.9,
    scalar: 1.2,
    shapes: ['square', 'circle'],
  });

  // Left & Right celebratory fireworks cannons
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.65 },
      colors: ['#f59e0b', '#fbbf24', '#fde047', '#ffffff'],
      ticks: 240,
      scalar: 1.1,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.65 },
      colors: ['#ef4444', '#ec4899', '#f43f5e', '#ffffff'],
      ticks: 240,
      scalar: 1.1,
    });
  }, 180);

  // Starlight sparkle shower
  setTimeout(() => {
    confetti({
      particleCount: 35,
      spread: 120,
      origin: { y: 0.45, x: 0.5 },
      shapes: ['star'],
      colors: ['#ffd700', '#ffae00', '#ffffff'],
      ticks: 260,
      scalar: 1.3,
    });
  }, 360);
};

export const triggerStarShower = () => {
  confetti({
    particleCount: 45,
    spread: 90,
    origin: { y: 0.5, x: 0.5 },
    shapes: ['star'],
    colors: ['#f59e0b', '#fbbf24', '#ffd700', '#f43f5e'],
    ticks: 220,
  });
};
