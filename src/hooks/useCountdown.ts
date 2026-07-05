'use client';

import { useState, useEffect, useRef } from 'react';

export function useCountdown(initialSeconds: number, onExpire?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTimeRef = useRef<number | null>(null);

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    // Set absolute target time to prevent drift
    endTimeRef.current = Date.now() + initialSeconds * 1000;
    setSecondsLeft(initialSeconds);

    intervalRef.current = setInterval(() => {
      if (endTimeRef.current === null) return;
      
      const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onExpireRef.current?.();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initialSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    secondsLeft,
    minutes,
    seconds,
    display,
    isExpired: secondsLeft <= 0,
  };
}
