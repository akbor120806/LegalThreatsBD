'use client';

import { useEffect, useState } from 'react';

const SLIDES = [
  {
    icon: '⚖️',
    gradient: 'linear-gradient(135deg, #0f1c3f 0%, #1c2d5c 55%, #c69a3e 140%)',
    caption: 'Criminal Law',
  },
  {
    icon: '👨‍👩‍👧',
    gradient: 'linear-gradient(135deg, #142451 0%, #24356b 55%, #7c93d1 140%)',
    caption: 'Civil & Family Law',
  },
  {
    icon: '🏢',
    gradient: 'linear-gradient(135deg, #0a1329 0%, #142451 55%, #d8ac52 140%)',
    caption: 'Corporate Law',
  },
  {
    icon: '📜',
    gradient: 'linear-gradient(135deg, #1c2d5c 0%, #0f1c3f 55%, #e6c877 140%)',
    caption: 'Tax Law',
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-slider">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide ${i === index ? 'active' : ''}`}
          style={{ background: slide.gradient }}
        >
          <span className="hero-slide-icon">{slide.icon}</span>
        </div>
      ))}

      <div className="hero-slider-dots">
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show ${slide.caption} slide`}
            className={`hero-slider-dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
