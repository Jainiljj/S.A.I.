import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, FilePlus, IndianRupee } from 'lucide-react';

const API_BASE = '/api';

export default function LedgerTab({ triggerRefresh }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [ledger, setLedger] = useState({ client: null, invoices: [] });
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);

  // Forms
  const [newClient, setNewClient] = useState({ name: '', phone: '' });
  const [newInvoice, setNewInvoice] = useState({ amount: '', issue_date: '', due_date: '' });
  const [paymentState, setPaymentState] = useState({ amount: '', payment_date: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchLedger(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    const res = await axios.get(`${API_BASE}/clients`);
    setClients(res.data);
  };

  const fetchLedger = async (clientId) => {
    const res = await axios.get(`${API_BASE}/clients/${clientId}/invoices`);
    setLedger({ client: res.data.client, invoices: res.data.invoices });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/clients`, newClient);
    setNewClient({ name: '', phone: '' });
    setShowAddClient(false);
    fetchClients();
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/invoices`, { 
      client_id: selectedClient.id, 
      ...newInvoice 
    });
    setNewInvoice({ amount: '', issue_date: '', due_date: '' });
    setShowAddInvoice(false);
    fetchLedger(selectedClient.id);
    triggerRefresh();
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/payments`, {
      invoice_id: paymentInvoice.id,
      ...paymentState
    });
    setPaymentState({ amount: '', payment_date: '' });
    setPaymentInvoice(null);
    fetchLedger(selectedClient.id);
    triggerRefresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Client List */}
      <div className="card lg:col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-navy-700">Clients</h2>
          <button 
            onClick={() => setShowAddClient(!showAddClient)} 
            className="text-teal-600 hover:text-teal-800 p-2 bg-teal-50 rounded-full"
            title="Add Client"
          >
            <UserPlus size={20} />
          </button>
        </div>

        {showAddClient && (
          <form onSubmit={handleAddClient} className="mb-4 space-y-2 p-3 bg-gray-50 rounded-lg">
            <input 
              required
              placeholder="Name" 
              className="input-field py-2 text-sm" 
              value={newClient.name} 
              onChange={e => setNewClient({...newClient, name: e.target.value})} 
            />
            <input 
              required
              placeholder="Phone" 
              className="input-field py-2 text-sm" 
              value={newClient.phone} 
              onChange={e => setNewClient({...newClient, phone: e.target.value})} 
            />
            <button type="submit" className="btn-primary text-sm w-full py-2">Save</button>
          </form>
        )}

        <ul className="space-y-2 max-h-600 overflow-y-auto pr-2">
          {clients.map(c => (
            <li 
              key={c.id} 
              onClick={() => setSelectedClient(c)}
              className={`p-3 rounded-xl cursor-pointer transition ${
                selectedClient?.id === c.id ? 'bg-navy-600 text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className="font-semibold">{c.name}</div>
              <div className={`text-sm ${selectedClient?.id === c.id ? 'text-navy-200' : 'text-gray-500'}`}>{c.phone}</div>
            </li>
          ))}
          {clients.length === 0 && <p className="text-gray-400 italic">No clients yet.</p>}
        </ul>
      </div>

      {/* Ledger */}
      <div className="card lg:col-span-2">
        {selectedClient ? (
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-navy-700">{ledger.client?.name}'s Ledger</h2>
                <p className="text-gray-500">{ledger.client?.phone}</p>
              </div>
              <button 
                onClick={() => setShowAddInvoice(!showAddInvoice)}
                className="btn-primary flex items-center gap-2"
              >
                <FilePlus size={18} /> Add Invoice
              </button>
            </div>

            {showAddInvoice && (
              <form onSubmit={handleAddInvoice} className="mb-6 p-4 bg-teal-50 rounded-xl space-y-3 border border-teal-100">
                <h3 className="font-semibold text-teal-800">New Invoice</h3>
                <div className="flex gap-3">
                  <input required type="number" placeholder="Amount (₹)" className="input-field" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} />
                  <input required type="date" title="Issue Date" className="input-field text-gray-500" value={newInvoice.issue_date} onChange={e => setNewInvoice({...newInvoice, issue_date: e.target.value})} />
                  <input required type="date" title="Due Date" className="input-field text-gray-500" value={newInvoice.due_date} onChange={e => setNewInvoice({...newInvoice, due_date: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary py-2 w-full">Create Invoice</button>
              </form>
            )}

            <div className="space-y-4">
              {ledger.invoices.map(inv => (
                <div key={inv.id} className="border border-gray-100 p-4 rounded-xl bg-white shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-lg text-gray-800">Invoice #{inv.id}</span>
                      {inv.amount <= inv.paid_amount ? (
                        <span className="badge-warning bg-green-100 text-green-800">Paid</span>
                      ) : (
                        <span className="badge-warning bg-rose-100 text-rose-800">Outstanding: ₹{(inv.amount - inv.paid_amount).toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 grid grid-cols-2 gap-2 mt-2">
                      <div>Total: <span className="font-semibold text-gray-700">₹{inv.amount.toLocaleString('en-IN')}</span></div>
                      <div>Paid: <span className="font-semibold text-teal-600">₹{inv.paid_amount.toLocaleString('en-IN')}</span></div>
                      <div>Issued: {inv.issue_date}</div>
                      <div>Due: {inv.due_date}</div>
                    </div>
                  </div>
                  
                  {inv.amount > inv.paid_amount && (
                    <div className="w-full md:w-auto">
                      {paymentInvoice?.id === inv.id ? (
                        <form onSubmit={handlePayment} className="flex gap-2">
                          <input required type="number" placeholder="₹ Amount" className="input-field py-1 px-2 w-28 text-sm" value={paymentState.amount} onChange={e => setPaymentState({...paymentState, amount: e.target.value})} />
                          <input required type="date" className="input-field py-1 px-2 w-32 text-sm text-gray-500" value={paymentState.payment_date} onChange={e => setPaymentState({...paymentState, payment_date: e.target.value})} />
                          <button type="submit" className="bg-teal-600 text-white rounded-lg px-3 py-1 hover:bg-teal-700 text-sm font-semibold">Save</button>
                          <button type="button" onClick={() => setPaymentInvoice(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setPaymentInvoice(inv)}
                          className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition w-full md:w-auto justify-center"
                        >
                          <IndianRupee size={16} /> Record Pay
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {ledger.invoices.length === 0 && <div className="text-center text-gray-400 py-10">No invoices found for this client.</div>}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 min-h-300">
            Select a client to view their ledger
          </div>
        )}
      </div>
    </div>
  );
}
