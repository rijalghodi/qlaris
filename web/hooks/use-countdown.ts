import { useEffect, useState } from "react";

/**
 * Hook to manage countdown timer from a target date
 * @param targetDate - ISO string date when the timer should expire
 * @returns Object containing seconds remaining, isExpired flag, and formatted time string
 */
export function useCountdown(targetDate: string | null | undefined, onExpire?: () => void) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(true);

  useEffect(() => {
    if (!targetDate) {
      setIsExpired(true);
      setSecondsRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;
      const seconds = Math.floor(difference / 1000);

      if (seconds <= 0) {
        console.log("expired");
        setIsExpired(true);
        setSecondsRemaining(0);
        onExpire?.();
        return 0;
      }

      setIsExpired(false);
      setSecondsRemaining(seconds);
      return seconds;
    };

    // Initial calculation
    calculateTimeRemaining();

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    secondsRemaining,
    isExpired,
    formattedTime: formatTime(secondsRemaining),
  };
}
