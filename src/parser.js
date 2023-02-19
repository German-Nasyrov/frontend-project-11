const parse = (data) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(data, 'application/xml');

  if (xmlDocument.querySelector('parsererror')) throw new Error('invalid rss');

  const feedTitle = xmlDocument.querySelector('title').textContent;
  const feedDescription = xmlDocument.querySelector('description').textContent;

  const posts = [];
  const postsElements = xmlDocument.querySelectorAll('item');
  Array.from(postsElements).map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;
    return posts.push({ postTitle, postDescription, postLink });
  });

  return {
    feed: { feedTitle, feedDescription },
    posts,
  };
};

export default parse;
