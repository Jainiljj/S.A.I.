import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Minus, PackagePlus, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function InventoryTab({ triggerRefresh }) {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    sku: '', fabric: '', color: '', print: '', texture: '', stock_quantity: 0, reorder_level: 5
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await axios.get(`${API_BASE}/inventory`);
    setItems(res.data);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/inventory`, newItem);
    setNewItem({ sku: '', fabric: '', color: '', print: '', texture: '', stock_quantity: 0, reorder_level: 5 });
    setShowAdd(false);
    fetchInventory();
    triggerRefresh();
  };

  const handleAdjustStock = async (id, change) => {
    await axios.put(`${API_BASE}/inventory/${id}/stock`, { change });
    fetchInventory();
    triggerRefresh();
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold text-navy-700">Inventory Management</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          <PackagePlus size={18} /> Add Item
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddItem} className="mb-6 bg-gray-50 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 border border-gray-200">
          <input required placeholder="SKU (e.g. S001)" className="input-field" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} />
          <input placeholder="Fabric" className="input-field" value={newItem.fabric} onChange={e => setNewItem({...newItem, fabric: e.target.value})} />
          <input placeholder="Color" className="input-field" value={newItem.color} onChange={e => setNewItem({...newItem, color: e.target.value})} />
          <input placeholder="Print" className="input-field" value={newItem.print} onChange={e => setNewItem({...newItem, print: e.target.value})} />
          <input placeholder="Texture" className="input-field" value={newItem.texture} onChange={e => setNewItem({...newItem, texture: e.target.value})} />
          <input type="number" placeholder="Initial Stock" className="input-field" value={newItem.stock_quantity} onChange={e => setNewItem({...newItem, stock_quantity: e.target.value})} />
          <input type="number" placeholder="Reorder Level" className="input-field" value={newItem.reorder_level} onChange={e => setNewItem({...newItem, reorder_level: e.target.value})} />
          
          <button type="submit" className="btn-primary md:col-span-3 xl:col-span-4 py-3">Save Inventory Item</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition relative overflow-hidden group">
            {item.stock_quantity <= item.reorder_level && (
              <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-sm">
                <AlertTriangle size={12} /> Low Stock
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{item.sku}</h3>
                <p className="text-sm text-gray-500 capitalize">{item.color} • {item.fabric}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 mb-4 text-sm text-gray-600">
              <div>Print: <span className="font-medium text-gray-900">{item.print || '-'}</span></div>
              <div>Texture: <span className="font-medium text-gray-900">{item.texture || '-'}</span></div>
            </div>

            <div className="flex items-center justify-between mt-6 bg-gray-50 p-2 rounded-xl">
              <span className="text-sm font-semibold text-gray-500 pl-2 uppercase tracking-wider">Stock</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleAdjustStock(item.id, -1)}
                  className="bg-white hover:bg-rose-50 text-rose-600 border border-gray-200 p-2 rounded-lg shadow-sm transition"
                >
                  <Minus size={16} />
                </button>
                <span className={`text-xl font-bold w-8 text-center ${item.stock_quantity <= item.reorder_level ? 'text-rose-600' : 'text-navy-700'}`}>
                  {item.stock_quantity}
                </span>
                <button 
                  onClick={() => handleAdjustStock(item.id, 1)}
                  className="bg-white hover:bg-teal-50 text-teal-600 border border-gray-200 p-2 rounded-lg shadow-sm transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-gray-400 py-10">No inventory items.</div>}
      </div>
    </div>
  );
}
