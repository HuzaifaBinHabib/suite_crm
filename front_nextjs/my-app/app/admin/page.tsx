"use client"
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const triggerSync = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/sync`, { method: 'POST' });
      const data = await res.json();
      setResult(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">SYSTEM <span className="text-red-600">ADMIN</span></h1>
      <div className="bg-[#111] border border-gray-800 p-8 rounded-xl">
        <h2 className="text-xl mb-4 font-semibold">SuiteCRM User Synchronization</h2>
        <p className="text-gray-400 mb-8">This action pulls all user accounts from the MariaDB instance and mirrors them to PostgreSQL for system-wide access.</p>
        
        <button 
          onClick={triggerSync}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded font-bold transition disabled:opacity-50"
        >
          {loading ? 'EXECUTING SYNC...' : 'RUN MASTER SYNC'}
        </button>

        {result && (
          <div className="mt-8 p-4 bg-black border border-gray-700 font-mono text-xs text-green-500">
            {JSON.stringify(result, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}