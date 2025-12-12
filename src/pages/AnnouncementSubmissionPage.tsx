import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: "ward" | "relief_society" | "elders_quorum" | "youth" | "primary" | "stake" | "other";
}

interface SubmissionFormData {
  submitterName: string;
  submitterEmail: string;
  announcements: Announcement[];
}



const audienceOptions = [
  { value: "ward", label: "Ward" },
  { value: "relief_society", label: "Relief Society" },
  { value: "elders_quorum", label: "Elders Quorum" },
  { value: "youth", label: "Youth" },
  { value: "primary", label: "Primary" },
  { value: "stake", label: "Stake" },
  { value: "other", label: "Other" }
];

export default function AnnouncementSubmissionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [formData, setFormData] = useState<SubmissionFormData>({
    submitterName: "",
    submitterEmail: "",
    announcements: [{
      id: Date.now().toString(),
      title: "",
      content: "",
      audience: "ward"
    }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (field: keyof SubmissionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addAnnouncement = () => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: "",
      content: "",
      audience: "ward"
    };
    setFormData(prev => ({
      ...prev,
      announcements: [...prev.announcements, newAnnouncement]
    }));
  };

  const removeAnnouncement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      announcements: prev.announcements.filter(ann => ann.id !== id)
    }));
  };

  const updateAnnouncement = (id: string, field: keyof Announcement, value: any) => {
    setFormData(prev => ({
      ...prev,
      announcements: prev.announcements.map(ann => 
        ann.id === id ? { ...ann, [field]: value } : ann
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slug) {
      setErrorMessage("Invalid submission link");
      setSubmitStatus("error");
      return;
    }

    if (!formData.submitterName.trim() || formData.announcements.length === 0) {
      setErrorMessage("Please fill in your name and at least one announcement");
      setSubmitStatus("error");
      return;
    }

    // Validate each announcement
    for (const announcement of formData.announcements) {
      if (!announcement.title.trim() || !announcement.content.trim()) {
        setErrorMessage("Please fill in title and content for all announcements");
        setSubmitStatus("error");
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      // Submit each announcement
      for (const announcement of formData.announcements) {
        const { error } = await supabase
          .from("announcement_submissions")
          .insert({
            profile_slug: slug,
            submitter_name: formData.submitterName.trim(),
            submitter_email: formData.submitterEmail.trim() || null,
            title: announcement.title.trim(),
            content: announcement.content.trim(),
            audience: announcement.audience
          });

        if (error) {
          throw error;
        }
      }

      setSubmitStatus("success");
      setFormData({
        submitterName: "",
        submitterEmail: "",
        announcements: [{
          id: Date.now().toString(),
          title: "",
          content: "",
          audience: "ward"
        }]
      });
    } catch (error) {
      setErrorMessage("Failed to submit announcements. Please try again.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your announcement has been submitted successfully. It will be reviewed and added to the bulletin if approved.
          </p>
          <button
            onClick={() => setSubmitStatus("idle")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition-colors"
          >
            Submit Another Announcement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Announcement</h1>
            <p className="text-gray-600">
              Share your announcement with the ward. Your submission will be reviewed and added to the bulletin.
            </p>
          </div>

          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={formData.submitterName}
                    onChange={(e) => handleInputChange("submitterName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={formData.submitterEmail}
                    onChange={(e) => handleInputChange("submitterEmail", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

              </div>
            </div>

            {/* Announcements */}
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addAnnouncement}
                  className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Announcement
                </button>
              </div>

              {formData.announcements.map((announcement, idx) => (
                <div key={announcement.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-900">Announcement {idx + 1}</h4>
                    {formData.announcements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAnnouncement(announcement.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Announcement Title *
                    </label>
                    <input
                      type="text"
                      value={announcement.title}
                      onChange={(e) => updateAnnouncement(announcement.id, "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Announcement Content *
                    </label>
                    <ReactQuill
                      value={announcement.content}
                      onChange={(value) => updateAnnouncement(announcement.id, "content", value)}
                      placeholder="Enter the full announcement details..."
                      className="quill-no-border"
                      theme="snow"
                      modules={{
                        toolbar: [
                          [{ 'size': ['small', false, 'large', 'huge'] }],
                          ['bold', 'italic', 'underline', { 'color': [] }, 'link'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['clean']
                        ]
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Audience *
                      </label>
                      <select
                        value={announcement.audience}
                        onChange={(e) => updateAnnouncement(announcement.id, "audience", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {audienceOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>


                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  `Submit ${formData.announcements.length} Announcement${formData.announcements.length > 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>📋 Your announcement will be reviewed by the bulletin editor</li>
              <li>✅ If approved, it will be added to the next bulletin</li>
              <li>🔎 All submissions are reviewed for appropriateness and clarity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
