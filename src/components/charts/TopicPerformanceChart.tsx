'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { topic: 'Physics', score: 85 },
  { topic: 'Chemistry', score: 78 },
  { topic: 'Math', score: 92 },
  { topic: 'Biology', score: 88 },
  { topic: 'English', score: 75 },
];

const TopicPerformanceChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="topic" />
        <YAxis domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
        />
        <Bar
          dataKey="score"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          animationDuration={2000}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopicPerformanceChart; 