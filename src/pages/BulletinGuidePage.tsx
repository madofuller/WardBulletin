import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Megaphone, Music, Layout, Share2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StaticPageLayout from '../components/StaticPageLayout';

export default function BulletinGuidePage() {
  const { t } = useTranslation();

  return (
    <StaticPageLayout>
      <Helmet>
        <title>How to Create a Great Ward Bulletin | WardBulletin</title>
        <meta name="description" content="Learn how to create an effective LDS ward bulletin. Tips for sacrament meeting programs, announcements, hymn selection, and making your bulletin engaging for ward members." />
        <link rel="canonical" href="https://wardbulletin.com/guide/create-ward-bulletin" />
        <meta property="og:title" content="How to Create a Great Ward Bulletin - Tips & Best Practices" />
        <meta property="og:description" content="Learn how to create an effective LDS ward bulletin. Tips for sacrament meeting programs, announcements, hymn selection, and making your bulletin engaging for ward members." />
        <meta property="og:url" content="https://wardbulletin.com/guide/create-ward-bulletin" />
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Header image */}
        <div className="relative h-48 sm:h-56 rounded-t-xl overflow-hidden max-w-2xl mx-auto mt-8">
          <img
            src="/calling_the_fishermen.jpeg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
        </div>

        <article className="bg-white rounded-b-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">{t('guide.bulletinGuide.title')}</h1>
          <p className="mb-6 text-lg text-gray-700">
            {t('guide.bulletinGuide.intro')}
          </p>

          {/* Table of contents */}
          <nav className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('guide.toc')}</p>
            <ul className="space-y-1 text-sm">
              <li><a href="#essentials" className="text-blue-600 hover:text-blue-800">{t('guide.bulletinGuide.essentials.heading')}</a></li>
              <li><a href="#announcements" className="text-blue-600 hover:text-blue-800">{t('guide.bulletinGuide.announcements.heading')}</a></li>
              <li><a href="#hymns" className="text-blue-600 hover:text-blue-800">{t('guide.bulletinGuide.hymns.heading')}</a></li>
              <li><a href="#readability" className="text-blue-600 hover:text-blue-800">{t('guide.bulletinGuide.readability.heading')}</a></li>
              <li><a href="#sharing" className="text-blue-600 hover:text-blue-800">{t('guide.bulletinGuide.sharing.heading')}</a></li>
              <li><a href="#efficiency" className="text-blue-600 hover:text-blue-800">{t('guide.bulletinGuide.efficiency.heading')}</a></li>
            </ul>
          </nav>

          <h2 id="essentials" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <FileText className="w-6 h-6 flex-shrink-0" />
            {t('guide.bulletinGuide.essentials.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.bulletinGuide.essentials.intro')}
          </p>
          <ul className="mb-6 list-disc ml-6 space-y-2 text-gray-700">
            {(t('guide.bulletinGuide.essentials.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 id="announcements" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <Megaphone className="w-6 h-6 flex-shrink-0" />
            {t('guide.bulletinGuide.announcements.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.bulletinGuide.announcements.intro')}
          </p>
          <ul className="mb-6 list-disc ml-6 space-y-2 text-gray-700">
            {(t('guide.bulletinGuide.announcements.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800"><b>{t('bulletin.tip')}:</b> {t('guide.bulletinGuide.announcements.tip')}</p>
          </div>

          <h2 id="hymns" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <Music className="w-6 h-6 flex-shrink-0" />
            {t('guide.bulletinGuide.hymns.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.bulletinGuide.hymns.intro')}
          </p>
          <ul className="mb-6 list-disc ml-6 space-y-2 text-gray-700">
            {(t('guide.bulletinGuide.hymns.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 id="readability" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <Layout className="w-6 h-6 flex-shrink-0" />
            {t('guide.bulletinGuide.readability.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.bulletinGuide.readability.intro')}
          </p>
          <ul className="mb-6 list-disc ml-6 space-y-2 text-gray-700">
            {(t('guide.bulletinGuide.readability.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 id="sharing" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <Share2 className="w-6 h-6 flex-shrink-0" />
            {t('guide.bulletinGuide.sharing.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.bulletinGuide.sharing.intro')}
          </p>
          <ul className="mb-6 list-disc ml-6 space-y-2 text-gray-700">
            {(t('guide.bulletinGuide.sharing.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 id="efficiency" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <Clock className="w-6 h-6 flex-shrink-0" />
            {t('guide.bulletinGuide.efficiency.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.bulletinGuide.efficiency.intro')}
          </p>
          <ul className="mb-6 list-disc ml-6 space-y-2 text-gray-700">
            {(t('guide.bulletinGuide.efficiency.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">{t('guide.readyToCreate')}</h3>
            <p className="text-gray-700 mb-4">
              {t('guide.readyToCreateDesc')}
            </p>
            <a href="/?template=builtin-sacrament" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {t('guide.startBuilding')}
            </a>
          </div>
        </article>
      </main>
    </StaticPageLayout>
  );
}
