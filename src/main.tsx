import './index.css';
import { isPublicBulletinPath } from './lib/isPublicBulletinPath';

if (isPublicBulletinPath(window.location.pathname)) {
  void import('./public-main');
} else {
  void import('./editor-main');
}
