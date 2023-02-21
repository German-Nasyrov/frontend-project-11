const parse = (data) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(data, 'application/xml');

  if (xmlDocument.querySelector('parsererror')) throw new Error('invalid rss');

  const title = xmlDocument.querySelector('title').textContent;
  const description = xmlDocument.querySelector('description').textContent;

  const postsElements = xmlDocument.querySelectorAll('item');
  const posts = Array.from(postsElements).map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;
    return { postTitle, postDescription, postLink };
  });

  return {
    feed: { title, description },
    posts,
  };
};

export default parse;
