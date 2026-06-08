import { useState, useEffect } from 'react';

export const useInterviewTimer = (interview) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!interview) {
      setElapsedSeconds(0);
      setRemainingSeconds(0);
      return;
    }

    const tick = () => {
      if (interview.status === 'active' && interview.startedAt) {
        const elapsed = Math.floor((Date.now() - new Date(interview.startedAt).getTime()) / 1000);
        const remaining = Math.max(0, interview.durationMinutes * 60 - elapsed);
        setElapsedSeconds(elapsed);
        setRemainingSeconds(remaining);
      } else if (interview.status === 'ended' && interview.startedAt && interview.endedAt) {
        const elapsed = Math.floor(
          (new Date(interview.endedAt).getTime() - new Date(interview.startedAt).getTime()) / 1000
        );
        setElapsedSeconds(elapsed);
        setRemainingSeconds(0);
      } else {
        setElapsedSeconds(0);
        setRemainingSeconds(interview.durationMinutes * 60);
      }
    };

    tick();
    const interval = interview.status === 'active' ? setInterval(tick, 1000) : null;
    return () => clearInterval(interval);
  }, [interview]);

  return { elapsedSeconds, remainingSeconds };
};
