const StatsPanel = ({ ownedCount, recentCount, interviewCount }) => {
  const stats = [
    { label: 'Your rooms', value: ownedCount, mono: true },
    { label: 'Recent visits', value: recentCount, mono: true },
    { label: 'Interview rooms', value: interviewCount, mono: true },
  ];

  return (
    <div className="grid grid-cols-3 gap-px bg-gh-border border border-gh-border rounded-md overflow-hidden">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-gh-subtle px-4 py-3">
          <p className={`text-xl font-semibold text-gh-fg ${stat.mono ? 'font-mono' : ''}`}>
            {stat.value}
          </p>
          <p className="text-2xs text-gh-muted mt-0.5 uppercase tracking-wide">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;
