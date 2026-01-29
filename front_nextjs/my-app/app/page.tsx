"use client"
import { useState, useEffect } from 'react';

export default function ContactsCRUD() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone_work: '' });
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await fetch('http://localhost:8000/contacts');
      const data = await res.json();
      if (Array.isArray(data)) setContacts(data);
    } catch (e) { console.error("API Offline"); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) return;
    setLoading(true);
    await fetch('http://localhost:8000/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ first_name: '', last_name: '', phone_work: '' });
    await fetchContacts();
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-12 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tighter text-white">SUITE_CRM <span className="text-blue-500">CORE</span></h1>
          <p className="text-gray-500 text-sm mt-1">External Contact Management System</p>
        </header>

        {/* Input Form - Dark Glassmorphism style */}
        <section className="mb-10">
          <form onSubmit={handleAdd} className="bg-[#111] border border-gray-800 p-6 rounded-lg shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">First Name</label>
                <input 
                  required
                  className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none transition-all"
                  value={formData.first_name} 
                  onChange={e => setFormData({...formData, first_name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">Last Name</label>
                <input 
                  required
                  className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none transition-all"
                  value={formData.last_name} 
                  onChange={e => setFormData({...formData, last_name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">Phone Number</label>
                <input 
                  required
                  className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none transition-all"
                  value={formData.phone_work} 
                  onChange={e => setFormData({...formData, phone_work: e.target.value})} 
                />
              </div>
            </div>
            <button 
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'SYNCING...' : 'REGISTER CONTACT'}
            </button>
          </form>
        </section>

        {/* Data Table */}
        <section className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#171717]">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Member Name</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Contact Details</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length > 0 ? (
                contacts.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-900 hover:bg-[#1a1a1a] transition-all group">
                    <td className="p-4">
                      <div className="font-semibold text-gray-200">{c.first_name} {c.last_name}</div>
                      <div className="text-[10px] text-gray-600 font-mono uppercase mt-1">{c.id.substring(0,8)}...</div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {c.phone_work}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={async () => {
                          await fetch(`http://localhost:8000/contacts/${c.id}`, { method: 'DELETE' });
                          fetchContacts();
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-all"
                      >
                        Terminate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-600 italic">No records found in SuiteCRM database</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}