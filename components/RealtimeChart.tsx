'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SensorData {
  time: number; // timestamp
  value: number;
}

export default function RealtimeChart() {
  const [data, setData] = useState<SensorData[]>([]);

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
      console.log('Connected to NestJS WebSocket');
    });

    socket.on('sensorData', (msg: { topic: string; value: number; time: string }) => {
      const timestamp = new Date(msg.time).getTime();
      setData((prev) => [...prev.slice(-99), { time: timestamp, value: msg.value }]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <h1 className="text-2xl font-bold mb-4">Realtime Temperature (V1)</h1>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(t) => new Date(t).toLocaleTimeString()}
              tick={{ fill: '#333', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: '#333', fontSize: 12 }}
              domain={['auto', 'auto']}
              unit="°C"
            />
            <Tooltip
              labelFormatter={(t) => new Date(t).toLocaleTimeString()}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0070f3"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}