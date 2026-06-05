import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import PlanTrip from './pages/PlanTrip';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-2xl font-bold tracking-tight text-blue-600 hover:text-blue-700 transition">
                Tripie
              </Link>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                Home
              </Link>
              <Link to="/plan" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                Plan Trip
              </Link>
              <Link to="/plan" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-sm">
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Routed Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<PlanTrip />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Tripie. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
