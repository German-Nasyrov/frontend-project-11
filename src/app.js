import onChange from 'on-change';
import uniqueId from 'lodash/uniqueId.js';
import i18next from 'i18next';
import axios from 'axios';
import render from './render.js';
import validate from './validator.js';
import parse from './parser.js';
import resources from './locales/index.js';

export default () => {
  const htmlElements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modal: document.querySelector('.modal'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({ lng: 'ru', debug: true, resources });

  const state = {
    formState: 'filling',
    rssLinks: [],
    feeds: [],
    posts: [],
    visitedPostsID: [],
    error: '',
  };

  const watchedState = onChange(state, render(state, htmlElements, i18nInstance));

  const addNewFeed = (parsedRss, link) => {
    const { feed } = parsedRss;
    feed.id = uniqueId();
    feed.link = link;
    watchedState.feeds.unshift(feed);
  };

  const addNewPosts = (parsedRss, feed) => {
    const { posts } = parsedRss;
    posts.forEach((post) => {
      const { postTitle, postDescription, postLink } = post;
      const postID = uniqueId();
      const feedID = feed.id;
      watchedState.posts.unshift({
        postTitle, postDescription, postLink, postID, feedID,
      });
    });
  };

  const getData = (url) => {
    const proxy = 'https://allorigins.hexlet.app/get';
    const urlWithProxy = new URL(proxy);
    urlWithProxy.searchParams.set('disableCache', 'true');
    urlWithProxy.searchParams.set('url', url);
    return axios.get(urlWithProxy);
  };

  const updateRssElement = () => {
    const delay = 5000;
    const promises = state.rssLinks.map((url) => {
      getData(url).then((rss) => {
        const existingFeed = state.feeds.find((feed) => feed.link === url);
        const { posts } = parse(rss.data.contents);
        const collOfPostsLinks = state.posts.map((postInState) => postInState.postLink);
        const newPosts = posts.filter((post) => !collOfPostsLinks.includes(post.postLink));
        if (newPosts.length === 0) return;
        newPosts.map((post) => {
          post.postID = uniqueId();
          post.feedID = existingFeed.id;
          return post;
        });
        watchedState.posts.push(...newPosts);
      })
        .catch(() => { throw new Error(`${i18nInstance.t('feedback.feedUpdateError')}${url}`); });
      return state;
    });
    Promise.all(promises)
      .then(setTimeout(() => updateRssElement(), delay))
      .catch((error) => { throw new Error(error); });
  };

  const linkHandler = (link) => {
    validate(link, state.rssLinks)
      .then((validURL) => {
        watchedState.formState = 'sending';
        return getData(validURL);
      })
      .then((rss) => {
        const parsedRss = parse(rss.data.contents);
        addNewFeed(parsedRss, link);
        const feed = state.feeds.at(0);
        addNewPosts(parsedRss, feed);
        watchedState.rssLinks.push(link);
        watchedState.formState = 'success';
      })
      .catch((error) => {
        watchedState.error = error.type ?? error.message.toLowerCase();
        watchedState.formState = 'error';
      });
  };

  htmlElements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    linkHandler(formData.get('url'));
  });

  htmlElements.postsContainer.addEventListener('click', (event) => {
    watchedState.visitedPostsID.push(event.target.dataset.id);
  });

  updateRssElement();
};
