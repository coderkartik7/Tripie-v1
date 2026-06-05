import React from 'react';
import { Shield, ExternalLink, AlertTriangle } from 'lucide-react';

function getScoreStyles(score) {
  if (score >= 8) {
    return {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      ring: 'ring-emerald-200',
      bar: 'bg-emerald-500',
    };
  }
  if (score >= 6) {
    return {
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      ring: 'ring-amber-200',
      bar: 'bg-amber-500',
    };
  }
  return {
    badge: 'bg-red-100 text-red-700 border-red-200',
    ring: 'ring-red-200',
    bar: 'bg-red-500',
  };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function SafetyCard({ safety, destination }) {
  if (!safety) {
    return (
      <div className="p-5 border border-gray-150 rounded-2xl bg-white shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-16 bg-gray-200 rounded-xl mb-4" />
        <div className="space-y-3">
          <div className="h-14 bg-gray-200 rounded-lg" />
          <div className="h-14 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  const { safety_score, safety_label, articles = [] } = safety;
  const styles = getScoreStyles(safety_score);

  return (
    <div className="p-5 border border-gray-150 rounded-2xl bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-base font-bold text-gray-900">Safety & Advisories</h3>
      </div>

      {/* Safety score badge */}
      <div className={`flex items-center gap-4 p-4 rounded-xl border ${styles.badge} mb-4`}>
        <div
          className={`flex flex-col items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm ring-4 ${styles.ring}`}
        >
          <span className="text-2xl font-extrabold leading-none">{safety_score}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">/ 10</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{safety_label}</p>
          <p className="text-xs mt-1 opacity-80">
            Based on {articles.length} recent advisory article{articles.length !== 1 ? 's' : ''} for{' '}
            {destination || safety.destination}
          </p>
          <div className="mt-2 w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${styles.bar}`}
              style={{ width: `${(safety_score / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* News articles */}
      {articles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Advisories</p>
          {articles.map((article, i) => (
            <a
              key={article.url || i}
              href={article.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition group"
            >
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {article.url_to_image ? (
                  <img
                    src={article.url_to_image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition">
                  {article.title}
                </p>
                {article.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{article.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                  {article.source_name && <span className="font-medium">{article.source_name}</span>}
                  {article.published_at && (
                    <>
                      <span>•</span>
                      <span>{formatDate(article.published_at)}</span>
                    </>
                  )}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-500 shrink-0 mt-1" />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-3">
          No recent safety advisories found. Conditions appear favorable.
        </p>
      )}
    </div>
  );
}
