import { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import LedgerTab from './LedgerTab';
import InventoryTab from './InventoryTab';
import AIPromptTab from './AIPromptTab';
import { LayoutDashboard, BookOpen, PackageSearch, Sparkles } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('ledger');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-navy-600 text-white p-2 rounded-xl shadow-lg">
          <LayoutDashboard size={28} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-navy-800 tracking-tight">SAI <span className="text-teal-600">Trading</span></h1>
      </div>

      <DashboardHeader refreshTrigger={refreshTrigger} />

      {/* Tabs / Navigation */}
      <div className="flex bg-white-50 backdrop-blur-md rounded-2xl p-2 mb-8 shadow-sm border border-gray-100 overflow-x-auto gap-2">
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
        >
          <BookOpen size={20} /> Ledger
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
        >
          <PackageSearch size={20} /> Inventory
        </button>
        <button 
          onClick={() => setActiveTab('ai_prompt')}
          className={`tab-btn ${activeTab === 'ai_prompt' ? 'active' : ''}`}
        >
          <Sparkles size={20} /> AI Prompt
        </button>
      </div>

      {/* Main Content Area */}
      <div className="animate-fade-in">
        {activeTab === 'ledger' && <LedgerTab triggerRefresh={triggerRefresh} />}
        {activeTab === 'inventory' && <InventoryTab triggerRefresh={triggerRefresh} />}
        {activeTab === 'ai_prompt' && <AIPromptTab triggerRefresh={triggerRefresh} />}
      </div>
    </div>
  );
}

export default App;
