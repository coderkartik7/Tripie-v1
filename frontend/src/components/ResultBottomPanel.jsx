import React, { useState } from 'react';
import PackingList from './PackingList';
import BudgetTracker from './BudgetTracker';
import { Luggage, Wallet } from 'lucide-react';

const TABS = [
  { id: 'packing', label: 'Packing List', icon: Luggage },
  { id: 'budget', label: 'Budget', icon: Wallet },
];

export default function ResultBottomPanel() {
  const [activeTab, setActiveTab] = useState('packing');

  return (
    <div className="mt-8 rounded-2xl border border-gray-150 bg-white shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition border-b-2 -mb-px ${
              activeTab === id
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6">
        {activeTab === 'packing' && <PackingList />}
        {activeTab === 'budget' && <BudgetTracker />}
      </div>
    </div>
  );
}
