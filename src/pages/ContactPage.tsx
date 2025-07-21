import React from 'react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-gray-900">MyWardBulletin</a>
          <nav className="space-x-4">
            <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
            <a href="/how-to-use" className="text-gray-600 hover:text-gray-900">How To Use</a>
            <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Contact</h1>
        <p className="mb-2">Email us at <a className="text-blue-600" href="mailto:support@mywardbulletin.com">support@mywardbulletin.com</a>.</p>
      </main>
    </div>
  );
}
