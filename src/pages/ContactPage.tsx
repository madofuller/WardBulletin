import React from 'react';
import { Helmet } from 'react-helmet-async';
import StaticPageLayout from '../components/StaticPageLayout';

export default function ContactPage() {
  return (
    <StaticPageLayout>
      <Helmet>
        <title>Contact | WardBulletin</title>
        <meta name="description" content="Contact the WardBulletin team for help with your LDS ward bulletin. Questions about creating, sharing, or printing your sacrament meeting program? We're here to help." />
        <link rel="canonical" href="https://wardbulletin.com/contact" />
        <meta property="og:title" content="Contact | WardBulletin" />
        <meta property="og:description" content="Contact the WardBulletin team for help with your LDS ward bulletin. Questions about creating, sharing, or printing your sacrament meeting program? We're here to help." />
        <meta property="og:url" content="https://wardbulletin.com/contact" />
      </Helmet>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">Contact</h1>
          <p className="mb-4 text-lg text-gray-700">
            Have a question, need help, or want to suggest a feature?<br/>
            I'd love to hear from you.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-2 text-blue-700">📬 Email</h2>
          <p className="mb-4 text-gray-700">
            You can reach me directly at:<br/>
            <a href="mailto:matthew@mywardbulletin.com" className="text-blue-600 underline">matthew@mywardbulletin.com</a>
          </p>
          <p className="mb-4 text-gray-700">
            I try to respond to all messages within 1–2 days. If it's urgent (like something broke on Sunday morning), please include <b>URGENT</b> in the subject line.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-2 text-blue-700">💡 Feedback or Feature Requests</h2>
          <p className="mb-4 text-gray-700">
          If there's something you'd like the tool to do, or something that's confusing, feel free to send it my way. WardBulletin is constantly improving based on real user input.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-2 text-blue-700">🙏 Built with Purpose</h2>
          <p className="mb-4 text-gray-700">
            This is a personal project built to support callings like the one my wife received. If it's helping your ward, I'd love to know. And if it's falling short, I want to fix it.
          </p>
          <p className="mb-4 text-gray-700">
            No forms. No bots. Just email me.<br/>
            <a href="mailto:matthew@mywardbulletin.com" className="text-blue-600 underline">matthew@mywardbulletin.com</a>
          </p>
        </div>
      </main>
    </StaticPageLayout>
  );
}
