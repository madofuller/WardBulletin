import React, { useState } from 'react';
import Header from '../components/Header';
import AuthModal from '../components/AuthModal';

export default function HowToUsePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Handler to redirect to homepage
  const goHome = () => { window.location.href = '/'; };
  // Handler to open auth modal
  const openAuthModal = () => setShowAuthModal(true);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header
        user={null}
        loading={false}
        currentBulletinId={null}
        hasUnsavedChanges={false}
        showQRCode={false}
        setShowQRCode={() => {}}
        setShowAuthModal={openAuthModal}
        handleNewBulletin={goHome}
        handleExportPDF={goHome}
        handleSaveBulletin={goHome}
        handleViewSavedBulletins={goHome}
        setUser={goHome}
        setShowProfile={goHome}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}

        hideExportPDF={true}
        hideQRCode={true}
        onlyNewBulletin={true}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">How to Use MyWardBulletin</h1>
          <p className="mb-6 text-lg text-gray-700">
            Creating and sharing a Sunday program should be simple. Here’s how to do it with MyWardBulletin:
          </p>
          <ol className="list-decimal list-inside mb-6 space-y-6 text-gray-700">
            <li>
              <b>Start Your Bulletin</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Go to <b>mywardbulletin.com</b></li>
                <li>Click “Start a New Bulletin”</li>
                <li>You’ll see a clean editor where you can add sections like:
                  <ul className="list-disc ml-6 mt-1">
                    <li>Date and Ward Name</li>
                    <li>Presiding and conducting</li>
                    <li>Opening/closing hymns</li>
                    <li>Speakers and prayers</li>
                    <li>Announcements</li>
                    <li>Custom notes</li>
                  </ul>
                </li>
                <li>The layout is flexible,add or remove anything you need.</li>
              </ul>
            </li>
            <li>
              <b>Customize As Needed</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Rearrange agenda items with simple position changes</li>
                <li>Click into each field to edit text</li>
                <li>Use the “+ Add Section” button for Speakers, Musical Numbers, or Bearing of Testimonies</li>
                <li>You can build as much as you want before signing in.</li>
              </ul>
            </li>
            <li>
              <b>Sign In to Save and Share</b>
              <p className="mt-2">Once your bulletin is ready:</p>
              <ul className="list-disc ml-6 mt-1 space-y-1">
                <li>Click “Save or Share”</li>
                <li>You’ll be prompted to sign in or create a free account</li>
                <li>After signing in, your bulletin will be saved to your account and you’ll get:</li>
                <ul className="list-disc ml-6 mt-1">
                  <li>✅ A custom link to share (great for email, text, or announcements)</li>
                  <li>✅ An auto-generated QR code (great for chapel doors, screens, or printed copies)</li>
                </ul>
                <li>You can return to your saved bulletins anytime from any device.</li>
              </ul>
            </li>
            <li>
              <b>Print (If Needed)</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Click “Export as PDF” to generate a printable version</li>
                <li>The layout is automatically optimized for folding and Sunday distribution</li>
                <li>Works on standard printer paper with no formatting required</li>
              </ul>
            </li>
            <li>
              <b>Reuse and Manage Bulletins</b>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>All your saved bulletins appear in your dashboard</li>
                <li>Duplicate a past bulletin to use as a template for next week</li>
                <li>Make edits anytime, even Sunday morning before sacrament meeting</li>
                <li>QR codes and links update in real time, so your ward always sees the latest version</li>
              </ul>
            </li>
          </ol>
          <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-700">Need to Keep It Offline?</h2>
          <ul className="mb-6 list-disc ml-6 text-gray-700">
            <li>You can build a full bulletin before signing in</li>
            <li>If you don’t want to create an account, you can still print directly from your browser<br/>
              <span className="text-xs text-gray-500">(Note: sharing links and QR codes require sign-in)</span>
            </li>
          </ul>
          <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-700">Tips</h2>
          <ul className="mb-6 list-disc ml-6 text-gray-700">
            <li>Use the short share link or QR code on printed signs or slides for easy Sunday access</li>
            <li>Combine physical and digital: print a few copies, but let most members view it on their phone</li>
            <li>Last-minute change? Just edit and reprint—or let members use the same link</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4 text-blue-700">Announcement Submissions</h2>
          <p className="mb-4 text-gray-700">
            MyWardBulletin now includes a collaborative announcement system that allows ward members to submit announcements directly to your bulletin!
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">For Ward Members (Submitting Announcements)</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><b>Get the submissions link</b> - Ask your bulletin editor for the submissions link (usually something like <code className="bg-gray-100 px-1 rounded">mywardbulletin.com/submit/your-ward-name</code>)</li>
              <li><b>Submit announcements</b> - Use the form to add:
                <ul className="list-disc ml-6 mt-1">
                  <li>Your name and email</li>
                  <li>Announcement title and content</li>
                  <li>Target audience (Ward, Relief Society, Young Men, etc.)</li>
                </ul>
              </li>
              <li><b>Rich text editing</b> - Use the built-in editor to format your announcement with bold, italics, and different font sizes</li>
              <li><b>Submit multiple</b> - Add several announcements at once before submitting</li>
            </ol>
          </div>

          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-green-800">For Bulletin Editors (Managing Submissions)</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><b>Access submissions</b> - Click "Review Submissions" in your toolbar (only appears when there are pending submissions)</li>
              <li><b>Review and approve</b> - See all submitted announcements organized by target audience</li>
              <li><b>Bulk actions</b> - Approve all announcements for a specific audience at once</li>
              <li><b>Auto-consolidation</b> - When you approve multiple announcements for the same audience, they're automatically combined into a single bulletin entry</li>
              <li><b>Add notes</b> - Provide feedback to submitters when rejecting announcements</li>
              <li><b>Archive system</b> - Keep track of approved and rejected submissions for reference</li>
            </ol>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-800">Setting Up Submissions for Your Ward</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><b>Create your profile</b> - Sign in and set up your custom profile slug (e.g., "sunset-hills-ward")</li>
              <li><b>Get your submissions link</b> - In the QR Code modal, click "Copy Submissions Link" to get your unique submissions URL</li>
              <li><b>Share the link</b> - Send the submissions link to ward members via email, text, or social media</li>
              <li><b>Monitor submissions</b> - Check the "Review Submissions" button in your toolbar for new submissions</li>
              <li><b>Approve and publish</b> - Review submissions and approve them to automatically add to your bulletin</li>
            </ol>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">Pro Tips for Submissions</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><b>Consolidation magic</b> - When you approve multiple announcements for the same audience, they're automatically combined with original titles preserved as headers</li>
              <li><b>Rich formatting</b> - Submitters can use bold, italics, and different font sizes to make their announcements stand out</li>

              <li><b>Mobile-friendly</b> - The submissions form works great on phones and tablets</li>
              <li><b>Audience targeting</b> - Organize announcements by specific groups (Ward, Relief Society, Young Men, etc.) for better bulletin organization</li>
            </ul>
          </div>
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              MyWardBulletin.com - Free Ward Bulletin Creator
            </p>
            <nav className="mt-4 space-x-4">
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/how-to-use" className="text-gray-600 hover:text-gray-900">How To Use</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
