"use client"
import { useState, useEffect } from 'react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone_work: string;
}

export default function ContactsCRUD() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone_work: '' });
  const [loading, setLoading] = useState(false);
  
  // NEW: State for Edit Modal
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/contacts`);
      const data = await res.json();
      if (Array.isArray(data)) setContacts(data as Contact[]);
    } catch (e) { console.error("API Offline: ", e); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({ first_name: '', last_name: '', phone_work: '' });
      await fetchContacts();
    } catch (e) { console.error("Add failed: ", e); } finally { setLoading(false); }
  };

  // NEW: Handle Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContact)
      });
      setEditingContact(null);
      await fetchContacts();
    } catch (e) { console.error("Update failed: ", e); } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to terminate this record?")) return;
    try {
      await fetch(`${API_URL}/contacts/${id}`, { method: 'DELETE' });
      await fetchContacts();
    } catch (e) { console.error("Delete failed: ", e); }
  };

  useEffect(() => { fetchContacts(); }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans relative">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-12 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tighter text-white">
            SUITE_CRM <span className="text-blue-500">CORE</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">External Contact Management System</p>
        </header>

        {/* Create Form */}
        <section className="mb-10">
          <form onSubmit={handleAdd} className="bg-[#111] border border-gray-800 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <input 
                placeholder="First Name"
                className="bg-black border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none"
                value={formData.first_name} 
                onChange={e => setFormData({...formData, first_name: e.target.value})} 
              />
              <input 
                placeholder="Last Name"
                className="bg-black border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none"
                value={formData.last_name} 
                onChange={e => setFormData({...formData, last_name: e.target.value})} 
              />
              <input 
                placeholder="Phone Number"
                className="bg-black border border-gray-700 p-3 rounded text-white focus:border-blue-500 outline-none"
                value={formData.phone_work} 
                onChange={e => setFormData({...formData, phone_work: e.target.value})} 
              />
            </div>
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded disabled:opacity-50">
              {loading ? 'SYNCING...' : 'REGISTER CONTACT'}
            </button>
          </form>
        </section>

        {/* Table */}
        <section className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-[#171717]">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Member Name</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase">Contact Details</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-gray-900 hover:bg-[#1a1a1a] group">
                  <td className="p-4">
                    <div className="font-semibold text-gray-200">{c.first_name} {c.last_name}</div>
                  </td>
                  <td className="p-4 text-gray-400">{c.phone_work}</td>
                  <td className="p-4 text-right space-x-4">
                    <button 
                      onClick={() => setEditingContact(c)}
                      className="text-blue-500 hover:text-blue-400 text-xs font-bold uppercase"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:text-red-400 text-xs font-bold uppercase"
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* EDIT MODAL POP-UP */}
      {editingContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] border border-gray-700 p-8 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-blue-500">EDIT RECORD</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">FIRST NAME</label>
                <input 
                  className="w-full bg-black border border-gray-700 p-3 rounded"
                  value={editingContact.first_name}
                  onChange={e => setEditingContact({...editingContact, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">LAST NAME</label>
                <input 
                  className="w-full bg-black border border-gray-700 p-3 rounded"
                  value={editingContact.last_name}
                  onChange={e => setEditingContact({...editingContact, last_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">PHONE</label>
                <input 
                  className="w-full bg-black border border-gray-700 p-3 rounded"
                  value={editingContact.phone_work}
                  onChange={e => setEditingContact({...editingContact, phone_work: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 p-3 rounded font-bold">SAVE CHANGES</button>
                <button 
                  type="button" 
                  onClick={() => setEditingContact(null)}
                  className="flex-1 bg-gray-800 p-3 rounded font-bold"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}