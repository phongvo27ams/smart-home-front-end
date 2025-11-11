'use client';

import RealtimeChart from 'components/RealtimeChart';

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Realtime Sensor Data</h1>
      <RealtimeChart />
    </main>
  );
}