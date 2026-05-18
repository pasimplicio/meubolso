
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: string;
  gradient?: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  color,
  gradient,
  height = 8,
  showLabel = false,
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);

  // Auto color based on percentage
  const autoGradient =
    percent >= 90
      ? 'linear-gradient(90deg, #ff4d6a, #ff6b81)'
      : percent >= 70
        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
        : 'linear-gradient(90deg, #00d4aa, #00b894)';

  return (
    <div style={{ width: '100%' }}>
      <div className="progress-bar-bg" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${percent}%`,
            background: gradient || color || autoGradient,
          }}
        />
      </div>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 4,
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {percent.toFixed(0)}%
        </div>
      )}
    </div>
  );
}
