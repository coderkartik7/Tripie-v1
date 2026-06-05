import React, { useEffect, useMemo, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTripStore } from '../store/tripStore';
import { IndianRupee, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

const BUDGET_CATEGORIES = ['Transport', 'Food', 'Accommodation', 'Activities', 'Misc'];

const CATEGORY_COLORS = {
  Transport: '#8b5cf6',
  Food: '#10b981',
  Accommodation: '#6366f1',
  Activities: '#3b82f6',
  Misc: '#94a3b8',
};

const DEFAULT_ITINERARY = {
  total_estimated_cost: 15000,
  days: [
    {
      day: 1,
      title: 'Old Quarter & Lake Rest',
      day_total_cost: 4500,
      activities: [
        {
          time: '09:00 AM',
          name: 'Walking Tour of Hanoi Old Quarter',
          estimated_cost: 1000,
          type: 'sightseeing',
        },
        {
          time: '01:00 PM',
          name: 'Lunch at Bun Cha Huong Lien',
          estimated_cost: 1500,
          type: 'food',
        },
        {
          time: '04:30 PM',
          name: 'Sunset Walk at Hoan Kiem Lake',
          estimated_cost: 2000,
          type: 'sightseeing',
        },
      ],
    },
    {
      day: 2,
      title: 'Temple of Literature & Train Street',
      day_total_cost: 5000,
      activities: [
        {
          time: '09:30 AM',
          name: 'Hanoi Temple of Literature',
          estimated_cost: 2000,
          type: 'sightseeing',
        },
        {
          time: '03:00 PM',
          name: 'Coffee at Train Street',
          estimated_cost: 1000,
          type: 'food',
        },
      ],
    },
  ],
};

function normalizeBudgetCategory(type) {
  const key = String(type || '').toLowerCase();
  if (key === 'transport') return 'Transport';
  if (key === 'food') return 'Food';
  if (key === 'accommodation') return 'Accommodation';
  if (key === 'sightseeing' || key === 'adventure' || key === 'activities') return 'Activities';
  return 'Misc';
}

function buildBudgetItemsFromItinerary(itinerary) {
  if (!itinerary?.days?.length) return [];

  return itinerary.days.flatMap((day) =>
    (day.activities || []).map((activity, index) => ({
      id: `act-${day.day}-${index}`,
      name: activity.name || 'Unnamed activity',
      amount: Number(activity.estimated_cost) || 0,
      category: normalizeBudgetCategory(activity.type),
      day: day.day,
      dayTitle: day.title || `Day ${day.day}`,
      time: activity.time || '',
      source: 'itinerary',
    }))
  );
}

function getStorageKey(destination, startDate) {
  const dest = (destination || 'trip').toLowerCase().replace(/\s+/g, '-');
  const date = startDate || 'unknown';
  return `tripie-budget-${dest}-${date}`;
}

function formatINR(value) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-600">{formatINR(value)}</p>
    </div>
  );
}

function DayBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-gray-600">{formatINR(payload[0].value)}</p>
    </div>
  );
}

export default function BudgetTracker() {
  const {
    itinerary,
    tripRequest,
    budgetItems,
    setBudgetItems,
    updateBudgetItemCost,
  } = useTripStore();

  const destination = tripRequest?.destination || 'trip';
  const startDate = tripRequest?.start_date || '';
  const userBudget = Number(tripRequest?.budget) || 0;
  const storageKey = getStorageKey(destination, startDate);
  const initialized = useRef(false);

  const activeItinerary = itinerary || DEFAULT_ITINERARY;

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
          setBudgetItems(parsed);
          initialized.current = true;
          return;
        }
      } catch {
        // fall through to init from itinerary
      }
    }

    setBudgetItems(buildBudgetItemsFromItinerary(activeItinerary));
    initialized.current = true;
  }, [activeItinerary, storageKey, setBudgetItems]);

  useEffect(() => {
    if (!initialized.current || budgetItems.length === 0) return;
    localStorage.setItem(storageKey, JSON.stringify(budgetItems));
  }, [budgetItems, storageKey]);

  const totalEstimated = useMemo(
    () => budgetItems.reduce((sum, item) => sum + item.amount, 0),
    [budgetItems]
  );

  const budgetDelta = userBudget - totalEstimated;
  const isOverBudget = budgetDelta < 0;

  const categoryBreakdown = useMemo(() => {
    const totals = BUDGET_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    budgetItems.forEach((item) => {
      totals[item.category] = (totals[item.category] || 0) + item.amount;
    });

    return BUDGET_CATEGORIES.map((name) => ({
      name,
      value: totals[name],
    })).filter((entry) => entry.value > 0);
  }, [budgetItems]);

  const dayBreakdown = useMemo(() => {
    const byDay = {};
    budgetItems.forEach((item) => {
      const key = item.day ?? 0;
      if (!byDay[key]) {
        byDay[key] = {
          day: item.day,
          label: item.dayTitle ? `Day ${item.day}` : `Day ${key}`,
          title: item.dayTitle || '',
          cost: 0,
        };
      }
      byDay[key].cost += item.amount;
    });

    return Object.values(byDay)
      .sort((a, b) => a.day - b.day)
      .map((entry) => ({
        label: entry.label,
        cost: entry.cost,
        title: entry.title,
      }));
  }, [budgetItems]);

  const itemsByDay = useMemo(() => {
    const groups = {};
    budgetItems.forEach((item) => {
      const key = item.day ?? 0;
      if (!groups[key]) {
        groups[key] = {
          day: item.day,
          title: item.dayTitle || `Day ${key}`,
          items: [],
        };
      }
      groups[key].items.push(item);
    });
    return Object.values(groups).sort((a, b) => a.day - b.day);
  }, [budgetItems]);

  const handleCostChange = (id, rawValue) => {
    const parsed = rawValue === '' ? 0 : Number(rawValue);
    updateBudgetItemCost(id, parsed);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-gray-900">Budget Tracker</h3>
            <p className="text-xs text-gray-500">
              {budgetItems.length} activities · {formatINR(totalEstimated)} estimated
            </p>
          </div>
        </div>
      </div>

      {/* Budget comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Budget</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatINR(userBudget)}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estimated Total</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatINR(totalEstimated)}</p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            isOverBudget
              ? 'border-red-100 bg-red-50/60'
              : 'border-emerald-100 bg-emerald-50/60'
          }`}
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
            {isOverBudget ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                Overage
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                Savings
              </>
            )}
          </p>
          <p
            className={`text-xl font-bold mt-1 ${
              isOverBudget ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {formatINR(Math.abs(budgetDelta))}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
          <h4 className="text-sm font-bold text-gray-800 mb-3">Budget Split</h4>
          {categoryBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">No cost data to display.</p>
          )}
        </div>

        {/* Per-day bar chart */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
          <h4 className="text-sm font-bold text-gray-800 mb-3">Per-Day Breakdown</h4>
          {dayBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayBreakdown} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<DayBarTooltip />} />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">No daily costs to display.</p>
          )}
        </div>
      </div>

      {/* Editable activity costs */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          Adjust Activity Costs
        </h4>

        {itemsByDay.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No activities with costs found in the itinerary.
          </p>
        ) : (
          itemsByDay.map((group) => {
            const dayTotal = group.items.reduce((sum, item) => sum + item.amount, 0);
            return (
              <div
                key={group.day}
                className="rounded-xl border border-gray-100 bg-white overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                  <div>
                    <span className="text-sm font-bold text-gray-900">Day {group.day}</span>
                    {group.title && (
                      <span className="text-xs text-gray-500 ml-2">{group.title}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">
                    {formatINR(dayTotal)}
                  </span>
                </div>
                <ul className="divide-y divide-gray-50">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.time && (
                            <span className="text-[11px] text-gray-400">{item.time}</span>
                          )}
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                            style={{
                              color: CATEGORY_COLORS[item.category],
                              borderColor: `${CATEGORY_COLORS[item.category]}33`,
                              backgroundColor: `${CATEGORY_COLORS[item.category]}14`,
                            }}
                          >
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm text-gray-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={item.amount}
                          onChange={(e) => handleCostChange(item.id, e.target.value)}
                          className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
