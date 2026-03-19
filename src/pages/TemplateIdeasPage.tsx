import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Palette, LayoutTemplate, Image, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StaticPageLayout from '../components/StaticPageLayout';

export default function TemplateIdeasPage() {
  const { t } = useTranslation();

  return (
    <StaticPageLayout>
      <Helmet>
        <title>Ward Bulletin Templates & Ideas | WardBulletin</title>
        <meta name="description" content="Free ward bulletin templates and design ideas for LDS sacrament meeting programs. Modern, clean layouts for wards and branches. Start with a template and customize." />
        <link rel="canonical" href="https://wardbulletin.com/guide/bulletin-templates" />
        <meta property="og:title" content="Ward Bulletin Templates & Ideas - Free LDS Bulletin Designs" />
        <meta property="og:description" content="Free ward bulletin templates and design ideas for LDS sacrament meeting programs. Modern, clean layouts for wards and branches." />
        <meta property="og:url" content="https://wardbulletin.com/guide/bulletin-templates" />
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Header image */}
        <div className="relative h-48 sm:h-56 rounded-t-xl overflow-hidden max-w-2xl mx-auto mt-8">
          <img
            src="/go_ye_therefore_and_teach_all_nations.jpeg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
        </div>

        <article className="bg-white rounded-b-xl shadow-lg p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-blue-800">{t('guide.templateIdeas.title')}</h1>
          <p className="mb-6 text-lg text-gray-700">
            {t('guide.templateIdeas.intro')}
          </p>

          {/* Table of contents */}
          <nav className="bg-gray-50 rounded-lg p-4 mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('guide.toc')}</p>
            <ul className="space-y-1 text-sm">
              <li><a href="#themes" className="text-blue-600 hover:text-blue-800">{t('guide.templateIdeas.themes.heading')}</a></li>
              <li><a href="#layouts" className="text-blue-600 hover:text-blue-800">{t('guide.templateIdeas.layouts.heading')}</a></li>
              <li><a href="#images" className="text-blue-600 hover:text-blue-800">{t('guide.templateIdeas.images.heading')}</a></li>
              <li><a href="#tips" className="text-blue-600 hover:text-blue-800">{t('guide.templateIdeas.tips.heading')}</a></li>
            </ul>
          </nav>

          <h2 id="themes" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <Palette className="w-6 h-6 flex-shrink-0" />
            {t('guide.templateIdeas.themes.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.templateIdeas.themes.intro')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-1">{t('guide.templateIdeas.themes.formal')}</h3>
              <p className="text-sm text-gray-600">{t('guide.templateIdeas.themes.formalDesc')}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-1">{t('guide.templateIdeas.themes.modern')}</h3>
              <p className="text-sm text-gray-600">{t('guide.templateIdeas.themes.modernDesc')}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-1">{t('guide.templateIdeas.themes.elegant')}</h3>
              <p className="text-sm text-gray-600">{t('guide.templateIdeas.themes.elegantDesc')}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-1">{t('guide.templateIdeas.themes.simple')}</h3>
              <p className="text-sm text-gray-600">{t('guide.templateIdeas.themes.simpleDesc')}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-1">{t('guide.templateIdeas.themes.friendly')}</h3>
              <p className="text-sm text-gray-600">{t('guide.templateIdeas.themes.friendlyDesc')}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-800 mb-1">{t('guide.templateIdeas.themes.handwritten')}</h3>
              <p className="text-sm text-gray-600">{t('guide.templateIdeas.themes.handwrittenDesc')}</p>
            </div>
          </div>

          <h2 id="layouts" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <LayoutTemplate className="w-6 h-6 flex-shrink-0" />
            {t('guide.templateIdeas.layouts.heading')}
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">{t('guide.templateIdeas.layouts.standard')}</h3>
          <p className="mb-4 text-gray-700">{t('guide.templateIdeas.layouts.standardIntro')}</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700 space-y-1">
            <p className="font-bold text-center">Sunset Hills Ward</p>
            <p className="text-center text-gray-500">Sacrament Meeting — March 2, 2026</p>
            <hr className="my-2" />
            <p>Presiding: Bishop Dave Smith</p>
            <p>Conducting: 1st Counselor John Smith</p>
            <p>Chorister: Debbie Hanes | Organist: Tom Webster</p>
            <hr className="my-2" />
            <p>Opening Hymn: #2 The Spirit of God</p>
            <p>Invocation: Jane Doe</p>
            <p>Sacrament Hymn: #169 As Now We Take the Sacrament</p>
            <p className="font-bold text-center">Administration of the Sacrament</p>
            <p>Speaker: Emily Johnson</p>
            <p>Musical Number: Primary Children</p>
            <p>Speaker: Brother Mark Davis</p>
            <p>Closing Hymn: #152 God Be with You Till We Meet Again</p>
            <p>Benediction: Robert Lee</p>
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">{t('guide.templateIdeas.layouts.fastSunday')}</h3>
          <p className="mb-4 text-gray-700">
            {t('guide.templateIdeas.layouts.fastSundayDesc')}
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">{t('guide.templateIdeas.layouts.babyBlessing')}</h3>
          <p className="mb-4 text-gray-700">
            {t('guide.templateIdeas.layouts.babyBlessingDesc')}
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">{t('guide.templateIdeas.layouts.heavyAnnouncements')}</h3>
          <p className="mb-4 text-gray-700">
            {t('guide.templateIdeas.layouts.heavyAnnouncementsDesc')}
          </p>

          <h2 id="images" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <Image className="w-6 h-6 flex-shrink-0" />
            {t('guide.templateIdeas.images.heading')}
          </h2>
          <p className="mb-4 text-gray-700">
            {t('guide.templateIdeas.images.intro')}
          </p>
          <ul className="mb-6 list-disc ml-6 space-y-2 text-gray-700">
            {(t('guide.templateIdeas.images.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800"><b>{t('bulletin.tip')}:</b> {t('guide.templateIdeas.images.tip')}</p>
          </div>

          <h2 id="tips" className="flex items-center gap-2 text-2xl font-bold mt-8 mb-4 text-blue-700">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            {t('guide.templateIdeas.tips.heading')}
          </h2>
          <ul className="mb-6 list-disc ml-6 space-y-2 text-gray-700">
            {(t('guide.templateIdeas.tips.items', { returnObjects: true }) as string[]).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <div className="bg-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">{t('guide.startWithTemplate')}</h3>
            <p className="text-gray-700 mb-4">
              {t('guide.startWithTemplateDesc')}
            </p>
            <a href="/?template=builtin-sacrament" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {t('guide.tryTemplateNow')}
            </a>
          </div>
        </article>
      </main>
    </StaticPageLayout>
  );
}
