const renderFormFillingSuccess = (htmlElements, i18next) => {
  const {
    form, input, submit, feedback,
  } = htmlElements;
  submit.disabled = false;
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18next.t('feedback.success');
  form.reset();
  input.focus();
};

const renderFormFillingError = (state, htmlElements, i18next) => {
  const { input, submit, feedback } = htmlElements;
  submit.disabled = false;
  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  switch (state.error) {
    case 'url':
      feedback.textContent = i18next.t('feedback.invalidUrl');
      break;
    case 'required':
      feedback.textContent = i18next.t('feedback.invalidRequired');
      break;
    case 'notOneOf':
      feedback.textContent = i18next.t('feedback.invalidNotOneOf');
      break;
    case 'network error':
      feedback.textContent = i18next.t('feedback.invalidNetwork');
      break;
    case 'invalid rss':
      feedback.textContent = i18next.t('feedback.invalidRSS');
      break;
    default:
      feedback.textContent = i18next.t('feedback.invalidUnknown');
  }
};

const formStateHandler = (state, htmlElements, i18next) => {
  const { input, submit, feedback } = htmlElements;
  switch (state.formState) {
    case 'filling':
      submit.disabled = false;
      input.classList.remove('is-invalid');
      feedback.textContent = '';
      break;
    case 'sending':
      submit.disabled = true;
      feedback.textContent = i18next.t('feedback.loading');
      break;
    case 'success':
      return renderFormFillingSuccess(htmlElements, i18next);
    case 'error':
      return renderFormFillingError(state, htmlElements, i18next);
    default:
      throw new Error(`${i18next.t('errors.unknownState')} ${state.formState}`);
  }
  return state;
};

const createInnerContainer = (container, i18next) => {
  const innerContainer = document.createElement('div');
  innerContainer.classList.add('card', 'border-0');
  innerContainer.innerHTML = `<div class="card-body"><h2 class="card-title h4">${i18next.t(`${container.id}`)}</h2></div>`;
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  innerContainer.append(list);
  return container.append(innerContainer);
};

const createFeedElement = (feed) => {
  const feedElement = document.createElement('li');
  feedElement.classList.add('list-group-item', 'border-0', 'border-end-0');
  const feedHeader = document.createElement('h3');
  feedHeader.textContent = feed.title;
  feedHeader.classList.add('h6', 'm-0');
  feedElement.append(feedHeader);
  const feedBody = document.createElement('p');
  feedBody.textContent = feed.description;
  feedBody.classList.add('m-0', 'small', 'text-black-50');
  feedElement.append(feedBody);
  return feedElement;
};

const createPostElement = (post, state, i18next) => {
  const postElement = document.createElement('li');
  postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0', 'post-font-size');
  const postLink = document.createElement('a');
  postLink.setAttribute('href', `${post.postLink}`);
  if (state.visitedPostsID.includes(post.postID)) postLink.classList.add('fw-normal', 'text-muted');
  else { postLink.classList.add('fw-bold'); }
  postLink.setAttribute('data-id', `${post.postID}`);
  postLink.setAttribute('target', '_blank');
  postLink.setAttribute('rel', 'noopener noreferrer');
  postLink.textContent = post.postTitle;
  const postButton = document.createElement('button');
  postButton.setAttribute('type', 'button');
  postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'button-styles');
  postButton.setAttribute('data-id', `${post.postID}`);
  postButton.setAttribute('data-bs-toggle', 'modal');
  postButton.setAttribute('data-bs-target', '#modal');
  postButton.textContent = i18next.t('postButtonRead');
  postElement.append(postLink);
  postElement.append(postButton);
  return postElement;
};

const readButtonHandler = (state, htmlElements, i18next) => {
  const { modal } = htmlElements;
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('.modal-description');
  const modalReadButton = modal.querySelector('.modal-link');
  const modalCloseButton = modal.querySelector('.modal-close');
  const currentPost = state.posts.find((post) => post.postID === state.visitedPostsID.at(-1));
  modalTitle.textContent = currentPost?.postTitle;
  modalDescription.textContent = currentPost?.postDescription;
  modalReadButton.setAttribute('href', `${currentPost?.postLink}`);
  modalReadButton.textContent = i18next.t('modal.read');
  modalCloseButton.textContent = i18next.t('modal.close');
  const postElement = document.querySelector(`[data-id="${currentPost?.postID}"]`);
  postElement?.classList.remove('fw-bold');
  postElement?.classList.add('fw-normal');
};

const renderContent = (state, htmlElements, i18next) => {
  const { feedsContainer, postsContainer } = htmlElements;
  feedsContainer.replaceChildren();
  postsContainer.replaceChildren();
  if (state.feeds.length === 0) return state.feeds;
  createInnerContainer(feedsContainer, i18next);
  createInnerContainer(postsContainer, i18next);
  const feedsList = feedsContainer.querySelector('ul');
  const postsList = postsContainer.querySelector('ul');
  state.feeds.forEach((feed) => feedsList.prepend(createFeedElement(feed)));
  state.posts.flat().forEach((post) => {
    postsList.prepend(createPostElement(post, state, i18next));
  });
  return state;
};

export default (state, htmlElements, i18next) => (path) => {
  switch (path) {
    case 'formState':
    case 'rssLinks':
    case 'error':
      return formStateHandler(state, htmlElements, i18next);
    case 'feeds':
    case 'posts':
      return renderContent(state, htmlElements, i18next);
    case 'visitedPostsID':
      readButtonHandler(state, htmlElements, i18next);
      return renderContent(state, htmlElements, i18next);
    default:
      throw new Error(`${i18next.t('errors.unknownPath')} ${path}`);
  }
};
