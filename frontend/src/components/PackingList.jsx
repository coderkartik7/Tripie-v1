import React, { useEffect, useRef, useState } from 'react';
import { useTripStore } from '../store/tripStore';
import { Clipboard, ClipboardCheck, Plus, Luggage } from 'lucide-react';

const CATEGORIES = ['Clothing', 'Documents', 'Electronics', 'Toiletries', 'Misc'];

const CATEGORY_ICONS = {
  Clothing: '👕',
  Documents: '📄',
  Electronics: '🔌',
  Toiletries: '🧴',
  Misc: '📦',
};

const DEFAULT_PACKING_LIST = [
  { item: 'Comfortable walking shoes', category: 'Clothing' },
  { item: 'Light jacket or sweater', category: 'Clothing' },
  { item: 'Passport / ID', category: 'Documents' },
  { item: 'Travel insurance documents', category: 'Documents' },
  { item: 'Phone & charger', category: 'Electronics' },
  { item: 'Power bank', category: 'Electronics' },
  { item: 'Toothbrush & toothpaste', category: 'Toiletries' },
  { item: 'Sunscreen', category: 'Toiletries' },
  { item: 'Reusable water bottle', category: 'Misc' },
  { item: 'Day backpack', category: 'Misc' },
];

function normalizeCategory(category) {
  if (!category) return 'Misc';
  const match = CATEGORIES.find(
    (c) => c.toLowerCase() === String(category).toLowerCase()
  );
  return match || 'Misc';
}

function normalizePackingList(rawList) {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((entry, index) => {
    if (typeof entry === 'string') {
      return {
        id: `gemini-${index}-${entry}`,
        name: entry,
        category: 'Misc',
        packed: false,
        custom: false,
      };
    }

    const name = entry.item || entry.name || 'Unnamed item';
    return {
      id: `gemini-${index}-${name}`,
      name,
      category: normalizeCategory(entry.category),
      packed: false,
      custom: false,
    };
  });
}

function getStorageKey(destination, startDate) {
  const dest = (destination || 'trip').toLowerCase().replace(/\s+/g, '-');
  const date = startDate || 'unknown';
  return `tripie-packing-${dest}-${date}`;
}

export default function PackingList() {
  const { itinerary, tripRequest, packingItems, setPackingItems, togglePackingItem, addPackingItem } =
    useTripStore();

  const destination = tripRequest?.destination || 'trip';
  const startDate = tripRequest?.start_date || '';
  const storageKey = getStorageKey(destination, startDate);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Misc');
  const [copied, setCopied] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    initialized.current = false;
  }, [storageKey]);

  useEffect(() => {
    if (initialized.current) return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPackingItems(parsed);
          initialized.current = true;
          return;
        }
      } catch {
        // fall through to init from itinerary
      }
    }

    const rawList = itinerary?.packing_list;
    const items =
      rawList && rawList.length > 0
        ? normalizePackingList(rawList)
        : normalizePackingList(DEFAULT_PACKING_LIST);

    setPackingItems(items);
    initialized.current = true;
  }, [itinerary, storageKey, setPackingItems]);

  useEffect(() => {
    if (!initialized.current || packingItems.length === 0) return;
    localStorage.setItem(storageKey, JSON.stringify(packingItems));
  }, [packingItems, storageKey]);

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: packingItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const uncheckedCount = packingItems.filter((item) => !item.packed).length;
  const packedCount = packingItems.filter((item) => item.packed).length;

  const handleCopyList = async () => {
    const unchecked = packingItems.filter((item) => !item.packed);
    if (unchecked.length === 0) return;

    const lines = CATEGORIES.map((category) => {
      const catItems = unchecked.filter((item) => item.category === category);
      if (catItems.length === 0) return null;
      return `${category}:\n${catItems.map((item) => `  - ${item.name}`).join('\n')}`;
    })
      .filter(Boolean)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = lines;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;

    addPackingItem({
      id: `custom-${Date.now()}-${name}`,
      name,
      category: normalizeCategory(newItemCategory),
      packed: false,
      custom: true,
    });
    setNewItemName('');
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Luggage className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-gray-900">Packing List</h3>
            <p className="text-xs text-gray-500">
              {packedCount} packed · {uncheckedCount} remaining
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyList}
          disabled={uncheckedCount === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {copied ? (
            <>
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              Copied!
            </>
          ) : (
            <>
              <Clipboard className="w-4 h-4" />
              Copy list
            </>
          )}
        </button>
      </div>

      {/* Grouped items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grouped.map(({ category, items }) => (
          <div
            key={category}
            className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
          >
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>{CATEGORY_ICONS[category]}</span>
              {category}
              <span className="text-xs font-normal text-gray-400">
                ({items.length})
              </span>
            </h4>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => togglePackingItem(item.id)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span
                      className={`text-sm leading-snug transition ${
                        item.packed
                          ? 'line-through text-gray-400'
                          : 'text-gray-800 group-hover:text-blue-700'
                      }`}
                    >
                      {item.name}
                      {item.custom && (
                        <span className="ml-1.5 text-[10px] text-blue-500 font-medium">
                          custom
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {packingItems.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-6">
          No packing items yet. Add your own below.
        </p>
      )}

      {/* Add custom item */}
      <form
        onSubmit={handleAddItem}
        className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100"
      >
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add a custom item..."
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!newItemName.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      </form>
    </div>
  );
}
