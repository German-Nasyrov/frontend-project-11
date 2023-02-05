import './styles.scss';
import 'bootstrap';
import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import render from './render.js';
import uniqueId from 'lodash';

const validate = (link, collection) => {
    const schemaStr = yup.string().required().url().trim();
    const schemaMix = yup.mixed().notOneOf([collection]);
    return schemaStr.validate(link)
        .then((url) => schemaMix.validate(url));
};

export default (i18n) => {
    const elements = {
        form: document.querySelector('form'),
        input: document.querySelector('#url-input'),
        submit: document.querySelector('[type="submit"]'),
        feedback: document.querySelector('.feedback'),
    };
    const state = {
        formState: 'filling',
        rssLinks: [],
    };

    const watchedState = onChange(state, render(state, elements, i18n));

    const handleEnteredLink = (link) => {
        validate(link, state.rssLinks)
            .then((validURL) => {
                watchedState.formState = 'sending';
                return getData(validURL);
            })
            .then((rss) => {
                const parsedRss = parse(rss.data.contents);
                addNewRss(parsedRss, link);
                state.rssLinks.push(link);
                state.error = '';
                watchedState.formState = 'success';
            })
            .catch((err) => {
                state.error = err.type ?? err.message.toLowerCase();
                watchedState.formState = 'error';
            });
    };

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        handleEnteredLink(formData.get('url'));
    });
};


