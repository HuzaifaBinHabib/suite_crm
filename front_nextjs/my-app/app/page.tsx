 "use client"
import { useEffect, useState } from 'react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone_work: '' });
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`);
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ first_name: '', last_name: '', phone_work: '' });
        setTimeout(fetchContacts, 100); 
      }
    } finally { setLoading(false); }
  };

  // Open modal with contact data
  const openEditModal = (contact: any) => {
    setEditingContact({ ...contact });
    setIsEditModalOpen(true);
  };

  // Handle Update API call
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editingContact.first_name,
          last_name: editingContact.last_name,
          phone_work: editingContact.phone_work,
        }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchContacts();
      }
    } finally { setLoading(false); }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Terminate this contact in CRM & Analytics?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`, { method: 'DELETE' });
    fetchContacts();
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">
            SUITE_CRM <span className="text-purple-600">CORE</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono">External Contact Management System</p>
        </header>

        {/* REGISTRATION FORM */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input placeholder="First Name" className="bg-black border border-gray-800 p-4 rounded outline-none focus:border-purple-600 transition" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required />
              <input placeholder="Last Name" className="bg-black border border-gray-800 p-4 rounded outline-none focus:border-purple-600 transition" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required />
              <input placeholder="Phone Number" className="bg-black border border-gray-800 p-4 rounded outline-none focus:border-purple-600 transition" value={form.phone_work} onChange={e => setForm({...form, phone_work: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-10 rounded transition uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(126,34,206,0.3)]">
              {loading ? 'Processing...' : 'Register Contact'}
            </button>
          </form>
        </div>

        {/* DATA TABLE */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                <th className="px-8 py-4">Member Name</th>
                <th className="px-8 py-4">Contact Details</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 font-mono">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-purple-900/5 transition-all group">
                  <td className="px-8 py-6 font-bold text-lg group-hover:text-purple-400 transition-colors">{c.first_name} {c.last_name}</td>
                  <td className="px-8 py-6 text-gray-400">{c.phone_work || '---'}</td>
                  <td className="px-8 py-6 text-right space-x-6">
                    <button 
                      onClick={() => openEditModal(c)}
                      className="text-purple-500 hover:text-white hover:bg-purple-600 px-3 py-1 rounded-sm border border-transparent hover:border-purple-400 font-bold text-xs uppercase transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteContact(c.id)}
                      className="text-red-600 hover:text-white hover:bg-red-700 px-3 py-1 rounded-sm border border-transparent hover:border-red-500 font-bold text-xs uppercase transition-all"
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL POPUP */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0a0a0a] border border-purple-900/50 w-full max-w-md rounded-2xl p-8 shadow-[0_0_50px_rgba(126,34,206,0.2)] animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black mb-6 uppercase italic tracking-tighter text-purple-500">Update Profile</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">First Name</label>
                <input className="w-full bg-black border border-gray-800 p-3 rounded outline-none focus:border-purple-600" value={editingContact.first_name} onChange={e => setEditingContact({...editingContact, first_name: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Last Name</label>
                <input className="w-full bg-black border border-gray-800 p-3 rounded outline-none focus:border-purple-600" value={editingContact.last_name} onChange={e => setEditingContact({...editingContact, last_name: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-gray-500 font-bold ml-1">Phone Number</label>
                <input className="w-full bg-black border border-gray-800 p-3 rounded outline-none focus:border-purple-600" value={editingContact.phone_work} onChange={e => setEditingContact({...editingContact, phone_work: e.target.value})} />
              </div>
              
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 border border-gray-800 hover:bg-gray-900 py-3 rounded uppercase font-bold text-xs transition">Cancel</button>
                <button type="submit" className="flex-1 bg-purple-700 hover:bg-purple-600 py-3 rounded uppercase font-bold text-xs transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}