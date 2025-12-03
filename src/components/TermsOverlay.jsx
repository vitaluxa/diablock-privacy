import React from 'react';

export function TermsOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl max-w-lg w-full transform transition-all border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2 font-display">
            Contest Terms & Conditions
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded"></div>
        </div>

        <div className="space-y-4 text-gray-300 text-sm md:text-base">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <span>🎯</span> Contest Objective
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Reach <span className="text-yellow-400 font-bold">Level 500</span> in Dia Block to be eligible to win a brand new <span className="text-blue-400 font-semibold">iPhone 17 Pro</span>.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
              <span>🤖</span> Anti-Cheat & Validation
            </h3>
            <p className="text-gray-300 leading-relaxed mb-2">
              Our advanced algorithms will automatically verify the validity of your gameplay and score to ensure fair play:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-2">
              <li>All gameplay sessions are monitored for suspicious patterns</li>
              <li>Score validation algorithms check for impossible or bot-assisted gameplay</li>
              <li>AI-assisted solving tools are strictly prohibited and will result in disqualification</li>
              <li>Only legitimate, human-played games will be considered for the prize</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
              <span>✅</span> Fair Play Requirements
            </h3>
            <p className="text-gray-300 leading-relaxed mb-2">
              To maintain fairness, all participants must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-2">
              <li>Play manually without automation tools or scripts</li>
              <li>Avoid using AI solvers, bots, or third-party assistance</li>
              <li>Complete levels through genuine skill and strategy</li>
              <li>Maintain consistent gameplay patterns that match human behavior</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
              <span>⚖️</span> Verification Process
            </h3>
            <p className="text-gray-300 leading-relaxed">
              If you reach Level 500, our system will automatically analyze your gameplay data including move patterns, timing, and score progression. Winners will be contacted for additional verification before prize distribution.
            </p>
          </div>

          <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-600/50">
            <p className="text-yellow-200 text-xs leading-relaxed">
              <strong>Note:</strong> Any attempt to use bots, AI tools, or automation will result in immediate disqualification. Our detection systems are continuously updated to identify and prevent cheating.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transform transition-transform active:scale-95"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
