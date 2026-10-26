import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n/public';
import PublicBulletinPage from './pages/PublicBulletinPage';

const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PublicBulletinPage slug={slug} />
  </StrictMode>
);
