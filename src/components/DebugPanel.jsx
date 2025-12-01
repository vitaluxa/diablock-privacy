import React, { useEffect, useState } from 'react';
import { debugService } from '../services/debugService';

export function DebugPanel({ isOpen, onClose }) {
  const [report, setReport] = useState({ recentEvents: [], recentErrors: [], gameStateHistory: [] });

  useEffect(() => {
    if (isOpen) {
      const data = debugService.getDebugReport();
      setReport(data);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-4 rounded-lg w-11/12 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Debug Panel</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✖
        </button>
        <section className="mb-4">
          <h3 className="font-semibold">Recent Events</h3>
          <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-sm">{JSON.stringify(report.recentEvents, null, 2)}</pre>
        </section>
        <section className="mb-4">
          <h3 className="font-semibold">Recent Errors</h3>
          <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-sm">{JSON.stringify(report.recentErrors, null, 2)}</pre>
        </section>
        <section>
          <h3 className="font-semibold">Game State History</h3>
          <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-sm">{JSON.stringify(report.gameStateHistory, null, 2)}</pre>
        </section>
      </div>
    </div>
  );
}
