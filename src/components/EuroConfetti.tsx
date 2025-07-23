import React from 'react';
import Particles from 'react-tsparticles';

export default function EuroConfetti() {
  return (
    <Particles
      options={{
        fullScreen: { enable: true, zIndex: 9999 },
        particles: {
          number: { value: 80 },
          move: { enable: true, speed: 6, direction: 'none', outModes: 'out' },
          shape: {
            type: 'text',
            options: {
              text: {
                value: ['M', 'O', 'T', 'O', 'P', 'P'],
              },
            },
          },
          size: { value: 32, random: { enable: true, minimumValue: 16 } },
          color: { value: ['#FFD700', '#4caf50', '#1976D2'] },
          opacity: { value: 1 },
        },
        detectRetina: true,
        background: { color: 'transparent' },
      }}
    />
  );
}
