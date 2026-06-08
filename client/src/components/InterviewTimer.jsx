const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const InterviewTimer = ({ remainingSeconds, elapsedSeconds, durationMinutes, status }) => {
  const isLow = status === 'active' && remainingSeconds <= 300;

  return (
    <div className="flex items-center gap-2 font-mono text-2xs">
      {status === 'active' ? (
        <>
          <span className={`badge ${isLow ? 'badge-danger' : 'badge-warning'}`}>
            ⏱ {formatTime(remainingSeconds)}
          </span>
          <span className="text-gh-muted hidden sm:inline">
            / {durationMinutes}m · {formatTime(elapsedSeconds)} elapsed
          </span>
        </>
      ) : status === 'ended' ? (
        <span className="badge">ended · {formatTime(elapsedSeconds)}</span>
      ) : (
        <span className="badge">{durationMinutes}m scheduled</span>
      )}
    </div>
  );
};

export default InterviewTimer;
