import React, { useState, useEffect } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';

interface CountdownProps {
  targetDate: string;
  isCompleted: boolean;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, isCompleted }) => {
  const [timeLeft, setTimeLeft] = useState(differenceInSeconds(new Date(targetDate), new Date()));

  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      const diff = differenceInSeconds(new Date(targetDate), new Date());
      setTimeLeft(diff);
      if (diff <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isCompleted]);

  if (isCompleted) return <span className="text-emerald-400 font-medium">已完成</span>;

  if (timeLeft <= 0) {
    return <span className="text-red-500 font-bold uppercase tracking-wider">已逾期</span>;
  }

  const duration = intervalToDuration({ start: new Date(), end: new Date(targetDate) });
  
  // Custom formatting for elegance
  const parts = [];
  if (duration.days) parts.push(`${duration.days}天`);
  if (duration.hours) parts.push(`${duration.hours}小时`);
  if (duration.minutes) parts.push(`${duration.minutes}分`);
  if (duration.days === 0 && duration.hours === 0 && duration.minutes === 0) parts.push(`${duration.seconds}秒`);

  // Limit to 2 most significant units for cleanliness
  const displayString = parts.slice(0, 2).join(' ');

  return (
    <div className="font-mono text-sm tracking-tight flex items-center gap-1">
        <span className="opacity-60 text-xs uppercase mr-1">剩余</span>
        <span className="font-semibold">{displayString || '现在'}</span>
    </div>
  );
};

export default Countdown;