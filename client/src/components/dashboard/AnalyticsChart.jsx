import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsChart({ data, title, dataKey = 'value', xKey = 'name', color = '#3b82f6' }) {
  return (
    <div style={{ width: '100%', height: '300px', padding: '1rem 0' }}>
      {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', paddingLeft: '1rem' }}>{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey={xKey} stroke="var(--text-subtle)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-subtle)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={value => value > 1000 ? `$${value/1000}k` : value} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
            labelStyle={{ fontWeight: 'bold', color: 'var(--text-main)' }}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill={`url(#color${dataKey})`} 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

