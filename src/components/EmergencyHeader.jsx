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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4">
              <span className="animate-pulse text-lg">🚨</span>
              <span className="font-semibold">CRISIS? GET IMMEDIATE HELP</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="tel:911" className="bg-red-800 hover:bg-red-900 px-4 py-1 rounded font-bold transition-colors">
                📞 CALL 911
              </a>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded transition-colors"
              >
                {isExpanded ? '▼' : '▶'} More Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Emergency Contacts */}
      {isExpanded && (
        <div className="bg-red-50 border-b-4 border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow border-l-4 border-red-500">
                  <h3 className="font-bold text-red-800">{contact.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{contact.description}</p>
                  <a
                    href={`tel:${contact.number}`}
                    className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors"
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