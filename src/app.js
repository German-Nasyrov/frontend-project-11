/* eslint-disable no-param-reassign */
import onChange from 'on-change';
import uniqueId from 'lodash/uniqueId.js';
import render from './render.js';
import validate from './validator.js';
import getData from './getData.js';
import parse from './parser.js';

const delay = 5000;

export default (i18n) => {
  const htmlElements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modal: document.querySelector('.modal'),
  };

  const state = {
    formState: 'filling',
    rssLinks: [],
    feeds: [],
    posts: [],
    visitedPostsID: [],
  };

  const watchedState = onChange(state, render(state, htmlElements, i18n));

  const addNewRssElement = (parsedRss, link) => {
    const { feed, posts } = parsedRss;
    feed.id = uniqueId();
    feed.feedLink = link;
    watchedState.feeds.push(feed);
    posts.forEach((post) => {
      const { postTitle, postDescription, postLink } = post;
      const postID = uniqueId();
      const feedID = feed.id;
      watchedState.posts.push({
        postTitle, postDescription, postLink, postID, feedID,
      });
    });
  };

  const updateRssElement = () => {
    const promises = state.rssLinks.map((url) => {
      getData(url)
        .then((rss) => {
          const newFeed = state.feeds.find((feed) => feed.feedLink === url);
          const { feed, posts } = parse(rss.data.contents);
          feed.id = newFeed.id;
          const newPosts = posts.filter((post) => {
            const collOfPostsLinks = state.posts.map((postInState) => postInState.postLink);
            return !collOfPostsLinks.includes(post.postLink);
          });
          if (newPosts.length === 0) return;
          newPosts.forEach((post) => {
            post.postID = uniqueId();
            post.feedID = feed.id;
          });
          watchedState.posts = [...state.posts, ...newPosts];
        })
        .catch((error) => { throw new Error(`Ошибка при обновлении фида: ${url}`, error); });
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
        addNewRssElement(parsedRss, link);
        state.rssLinks.push(link);
        state.error = '';
        watchedState.formState = 'success';
      })
      .catch((error) => {
        state.error = error.type ?? error.message.toLowerCase();
        watchedState.formState = 'error';
      });
  };

  htmlElements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    linkHandler(formData.get('url'));
  });

  htmlElements.postsContainer.addEventListener('click', (event) => {
    state.currentVisitedPostID = event.target.dataset.id;
    watchedState.visitedPostsID.push(event.target.dataset.id);
  });

  updateRssElement();
};
