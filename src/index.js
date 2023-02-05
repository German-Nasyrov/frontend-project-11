import './styles.scss';
import 'bootstrap';
import i18n from 'i18next';
import resources from './locales/index.js';
import app from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const i18next = i18n.createInstance();
    i18next.init({
      lng: 'ru',
      debug: true,
      resources,
    })
      .then(() => app(i18next))
      .catch((e) => e.message);
  });


