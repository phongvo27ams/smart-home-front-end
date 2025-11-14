'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Device {
  id: number;
  name: string;
  mqttTopic: string;
}

interface SensorData {
  time: number;
  value: number;
}

export default function RealtimeDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [dataMap, setDataMap] = useState<Record<string, SensorData[]>>({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch('http://localhost:3000/devices', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        setDevices(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error('Failed to fetch devices:', err);
      }
    }

    fetchDevices();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io('http://localhost:3000', {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Connected to NestJS WebSocket with token');
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connect error:', err.message);
    });

    socket.on('sensorData', (msg: { topic: string; value: number; time: string }) => {
      const timestamp = new Date(msg.time).getTime();
      setDataMap(prev => {
        const topicData = prev[msg.topic] || [];
        return {
          ...prev,
          [msg.topic]: [...topicData.slice(-99), { time: timestamp, value: msg.value }],
        };
      });
    });


    return () => {
      socket.disconnect();
    };
  }, [token]);


  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-6">Realtime Device Dashboard</h1>

      {devices.length === 0 ? (
        <p className="text-gray-500">Loading devices...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
          {devices.map((device) => (
            <div
              key={device.id}
              className="p-4 bg-gray-50 border rounded-2xl shadow-md flex flex-col"
            >
              <h2 className="text-xl font-semibold mb-3">{device.name}</h2>
              <p className="text-sm text-gray-500 mb-2">Topic: {device.mqttTopic}</p>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataMap[device.mqttTopic] || []}>
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
                    />
                    <Tooltip
                      labelFormatter={(t) => new Date(t).toLocaleTimeString()}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
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
          ))}
        </div>
      )}
    </div>
  );
}