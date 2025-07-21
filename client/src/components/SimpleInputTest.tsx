import React, { useState } from 'react';

export default function SimpleInputTest() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  console.log('SimpleInputTest component rendered');

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Simple Input Test</h2>
      
      <div className="space-y-2">
        <label htmlFor="testFirstName">First Name (Test)</label>
        <input
          id="testFirstName"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Type here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="text-sm text-gray-600">Value: {firstName}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="testLastName">Last Name (Test)</label>
        <input
          id="testLastName"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Type here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <p className="text-sm text-gray-600">Value: {lastName}</p>
      </div>
    </div>
  );
}