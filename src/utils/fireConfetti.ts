import confetti from 'canvas-confetti';

export function fireEuroConfetti() {
  // Евро
  confetti({
    particleCount: 900, // больше конфетти
    spread: 90,
    origin: { y: 0.6 },
    scalar: 1.2,
    emoji: '€',
    emojiSize: 24,
    ticks: 400, // дольше живут
    startVelocity: 50, // медленнее старт
    gravity: 0.5, // медленнее падают
  } as any);

  // Банкноты слева
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.5, x: 0.1 },
    scalar: 1.5,
    emoji: 'M',
    emojiSize: 32,
    ticks: 500,
    startVelocity: 15,
    gravity: 0.5,
  } as any);

  // Банкноты справа
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.5, x: 0.9 },
    scalar: 1.5,
    emoji: 'O',
    emojiSize: 32,
    ticks: 500,
    startVelocity: 15,
    gravity: 0.5,
  } as any);

  // Классические конфетти
  confetti({
    particleCount: 100,
    spread: 120,
    origin: { y: 0.6 },
    shapes: ['circle'],
    colors: ['#FFD700', '#C0C0C0', '#E5E4E2'],
    ticks: 500,
    startVelocity: 20,
    gravity: 0.5,
  });
}
