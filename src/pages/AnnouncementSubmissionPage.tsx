import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle, AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import HtmlEditor from '../components/HtmlEditor';

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



const getAudienceOptions = (t: (key: string) => string) => [
  { value: "ward", label: t('terminology.ward') },
  { value: "relief_society", label: t('terminology.reliefSociety') },
  { value: "elders_quorum", label: t('terminology.eldersQuorum') },
  { value: "youth", label: t('terminology.youth') },
  { value: "primary", label: t('terminology.primary') },
  { value: "stake", label: t('terminology.stake') },
  { value: "other", label: t('common.other') }
];

export default function AnnouncementSubmissionPage() {
  const { t } = useTranslation();
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
      setErrorMessage(t('validation.invalidLink'));
      setSubmitStatus("error");
      return;
    }

    if (!formData.submitterName.trim() || formData.announcements.length === 0) {
      setErrorMessage(t('validation.pleaseFillInNameAndAnnouncement'));
      setSubmitStatus("error");
      return;
    }

    // Validate each announcement
    for (const announcement of formData.announcements) {
      if (!announcement.title.trim() || !announcement.content.trim()) {
        setErrorMessage(t('validation.pleaseFillInAllFields'));
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
      setErrorMessage(t('announcementForm.failedToSubmit'));
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('submissions.thankYou')}</h2>
          <p className="text-gray-600 mb-6">
            {t('submissions.announcementSubmittedSuccessfully')}
          </p>
          <button
            onClick={() => setSubmitStatus("idle")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition-colors"
          >
            {t('submissions.submitAnotherAnnouncement')}
          </button>
        </div>
      </div>
    );
  }

  const audienceOptions = getAudienceOptions(t);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('announcementForm.title')}</h1>
            <p className="text-gray-600">
              {t('announcementForm.description')}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('announcementForm.yourInformation')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('announcementForm.yourName')}
                  </label>
                  <input
                    type="text"
                    value={formData.submitterName}
                    onChange={(e) => handleInputChange("submitterName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('announcementForm.enterYourName')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('announcementForm.emailOptional')}
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
                  {t('announcementForm.addAnnouncement')}
                </button>
              </div>

              {formData.announcements.map((announcement, idx) => (
                <div key={announcement.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-900">{t('announcementForm.announcementNumber', { number: idx + 1 })}</h4>
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
                      {t('announcementForm.announcementTitle')}
                    </label>
                    <input
                      type="text"
                      value={announcement.title}
                      onChange={(e) => updateAnnouncement(announcement.id, "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('announcementForm.enterTitle')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('announcementForm.announcementContent')}
                    </label>
                    <HtmlEditor
                      value={announcement.content}
                      onChange={(value) => updateAnnouncement(announcement.id, "content", value || "")}
                      placeholder={t('form.content')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('announcementForm.targetAudience')}
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
                    {t('announcementForm.submitting')}
                  </>
                ) : (
                  formData.announcements.length > 1
                    ? t('announcementForm.submitCountPlural', { count: formData.announcements.length })
                    : t('announcementForm.submitCount', { count: formData.announcements.length })
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">{t('announcementForm.whatHappensNext')}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>{t('announcementForm.willBeReviewed')}</li>
              <li>{t('announcementForm.ifApproved')}</li>
              <li>{t('announcementForm.allSubmissionsReviewed')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
