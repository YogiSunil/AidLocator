import React, { useState } from 'react';

const EmergencyHeader = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', description: 'Police, Fire, Medical Emergency' },
    { name: 'Crisis Text Line', number: '741741', description: 'Text HOME for crisis support' },
    { name: 'National Suicide Prevention', number: '988', description: '24/7 crisis counseling' },
    { name: 'Domestic Violence Hotline', number: '1-800-799-7233', description: 'Safe, confidential support' },
    { name: 'Homeless Services', number: '211', description: 'Dial 2-1-1 for local resources' }
  ];

  return (
    <>
      {/* Emergency Banner */}
      <div className="bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-2">
              <span className="animate-pulse text-sm">🚨</span>
              <span className="text-sm font-semibold">CRISIS? GET HELP</span>
            </div>
            <div className="flex items-center space-x-2">
              <a href="tel:911" className="bg-red-800 hover:bg-red-900 px-3 py-1 rounded text-sm font-bold transition-colors">
                📞 911
              </a>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-red-700 hover:bg-red-800 px-2 py-1 rounded text-sm transition-colors"
              >
                {isExpanded ? '▼' : '▶'} More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Emergency Contacts */}
      {isExpanded && (
        <div className="bg-red-50 border-b-2 border-red-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-white rounded p-3 shadow border-l-2 border-red-500">
                  <h3 className="text-sm font-bold text-red-800">{contact.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">{contact.description}</p>
                  <a
                    href={`tel:${contact.number}`}
                    className="inline-block bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                  >
                    📞 {contact.number}
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-red-800 font-medium">
                ℹ️ If you're in immediate danger, call 911. All other services are free and confidential.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyHeader;