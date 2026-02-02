"use client"
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-10">STAFF <span className="text-blue-500">DIRECTORY</span></h1>
      <div className="grid gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-[#111] border border-gray-800 p-6 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">
                {/* If first_name is missing, show the user_name instead */}
                {(u.first_name || u.last_name) 
               ? `${u.first_name || ''} ${u.last_name || ''}` 
             : u.user_name}
            </h3>
              <p className="text-gray-500 text-sm">@{u.user_name}</p>
            </div>
            <div className="flex gap-4 items-center">
              <span className={`text-[10px] font-bold px-2 py-1 rounded ${u.status === 'Active' ? 'bg-green-900 text-green-400' : 'bg-gray-800'}`}>
                {u.status}
              </span>
              {u.is_admin === 1 && <span className="text-blue-500 text-[10px] font-bold border border-blue-500 px-2 py-1 rounded">ADMIN</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}