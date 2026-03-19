import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ListOrdered, Users, Music, BookOpen, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StaticPageLayout from '../components/StaticPageLayout';

export default function ProgramGuidePage() {
  const { t } = useTranslation();

  return (
    <StaticPageLayout>
      <Helmet>
        <title>Sacrament Meeting Program Guide | WardBulletin</title>
        <meta name="description" content="Complete guide to sacrament meeting programs for LDS wards. Learn what to include, the order of the meeting, hymn selection, and how to handle special meetings like fast Sunday." />
        <link rel="canonical" href="https://wardbulletin.com/guide/sacrament-meeting-program" />
        <meta property="og:title" content="Sacrament Meeting Program Guide - What to Include" />
        <meta property="og:description" content="Complete guide to sacrament meeting programs for LDS wards. Learn what to include, the order of the meeting, and how to handle special meetings." />
        <meta property="og:url" content="https://wardbulletin.com/guide/sacrament-meeting-program" />
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Header image */}
        <div className="relative h-48 sm:h-56 rounded-t-xl overflow-hidden max-w-2xl mx-auto mt-8">
          <img
            src="/christ_ordaining_the_apostles.jpeg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
        </div>

        <article className="bg-white rounded-b-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">{t('guide.programGuide.title')}</h1>
          <p className="mb-6 text-lg text-gray-700">
            {t('guide.programGuide.intro')}
          </p>

          {/* Table of contents */}
          <nav className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('guide.toc')}</p>
            <ul className="space-y-1 text-sm">
              <li><a href="#order" className="text-blue-600 hover:text-blue-800">{t('guide.programGuide.order.heading')}</a></li>
              <li><a href="#include" className="text-blue-600 hover:text-blue-800">{t('guide.programGuide.include.heading')}</a></li>
              <li><a href="#special" className="text-blue-600 hover:text-blue-800">{t('guide.programGuide.special.heading')}</a></li>
              <li><a href="#branch-ward" className="text-blue-600 hover:text-blue-800">{t('guide.programGuide.branchWard.heading')}</a></li>
            </ul>
          </nav>

          <h2 id="order" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <ListOrdered className="w-6 h-6 flex-shrink-0" />
            {t('guide.programGuide.order.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.programGuide.order.intro')}
          </p>
          <ol className="mb-6 list-decimal ml-6 space-y-2 text-gray-700">
            {(t('guide.programGuide.order.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>

          <h2 id="include" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <BookOpen className="w-6 h-6 flex-shrink-0" />
            {t('guide.programGuide.include.heading')}
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">{t('guide.programGuide.include.leadership')}</h3>
          <ul className="mb-4 list-disc ml-6 space-y-1 text-gray-700">
            {(t('guide.programGuide.include.leadershipItems', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3 className="flex items-center gap-2 text-xl font-semibold mt-6 mb-3 text-gray-800">
            <Music className="w-5 h-5 flex-shrink-0 text-blue-600" />
            {t('guide.programGuide.include.hymns')}
          </h3>
          <p className="mb-4 text-gray-700">
            {t('guide.programGuide.include.hymnsIntro')}
          </p>
          <ul className="mb-4 list-disc ml-6 space-y-1 text-gray-700">
            {(t('guide.programGuide.include.hymnsItems', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p className="mb-4 text-gray-700">
            {t('guide.programGuide.include.hymnsOptional')}
          </p>

          <h3 className="flex items-center gap-2 text-xl font-semibold mt-6 mb-3 text-gray-800">
            <Users className="w-5 h-5 flex-shrink-0 text-blue-600" />
            {t('guide.programGuide.include.speakers')}
          </h3>
          <p className="mb-4 text-gray-700">
            {t('guide.programGuide.include.speakersDesc')}
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">{t('guide.programGuide.include.prayers')}</h3>
          <p className="mb-4 text-gray-700">
            {t('guide.programGuide.include.prayersDesc')}
          </p>

          <h2 id="special" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <Calendar className="w-6 h-6 flex-shrink-0" />
            {t('guide.programGuide.special.heading')}
          </h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-2">{t('guide.programGuide.special.fastTestimony')}</h3>
            <p className="text-gray-700 text-sm">
              {t('guide.programGuide.special.fastTestimonyDesc')}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-2">{t('guide.programGuide.special.babyBlessing')}</h3>
            <p className="text-gray-700 text-sm">
              {t('guide.programGuide.special.babyBlessingDesc')}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-gray-800 mb-2">{t('guide.programGuide.special.conference')}</h3>
            <p className="text-gray-700 text-sm">
              {t('guide.programGuide.special.conferenceDesc')}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">{t('guide.programGuide.special.primaryProgram')}</h3>
            <p className="text-gray-700 text-sm">
              {t('guide.programGuide.special.primaryProgramDesc')}
            </p>
          </div>

          <h2 id="branch-ward" className="text-2xl font-bold mt-8 mb-4 text-blue-700">{t('guide.programGuide.branchWard.heading')}</h2>
          <p className="mb-4 text-gray-700">
            {t('guide.programGuide.branchWard.intro')}
          </p>
          <ul className="mb-6 list-disc ml-6 space-y-1 text-gray-700">
            {(t('guide.programGuide.branchWard.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">{t('guide.buildYourProgram')}</h3>
            <p className="text-gray-700 mb-4">
              {t('guide.buildYourProgramDesc')}
            </p>
            <a href="/?template=builtin-sacrament" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {t('guide.createYourProgram')}
            </a>
          </div>
        </article>
      </main>
    </StaticPageLayout>
  );
}
