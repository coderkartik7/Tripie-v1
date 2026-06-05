import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
        Welcome to <span className="text-blue-600">Tripie</span>
      </h1>
      <p className="max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl mb-8">
        Your ultimate AI-powered travel planner. Customize itineraries, discover safety scores, check the weather, book flights and hotels, and hear local tips in real-time.
      </p>
      <Link
        to="/plan"
        className="px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md transitionduration-150"
      >
        Start Planning
      </Link>
    </div>
  );
}
