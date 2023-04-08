const replaceHtmlEntites = (string) => {
  const div = document.createElement("div");
  div.innerHTML = string;
  return div.textContent || div.innerText;
}

const parse = (data) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(data, 'application/xml');
  const parseErrorElement = xmlDocument.querySelector('parsererror');
  if (parseErrorElement) throw new Error(parseErrorElement.textContent);
  const title = xmlDocument.querySelector('title').textContent
  const description = xmlDocument.querySelector('description').textContent
  const postsElements = xmlDocument.querySelectorAll('item');
  const posts = Array.from(postsElements).map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = replaceHtmlEntites(post.querySelector('description').textContent);
    const postLink = post.querySelector('link').textContent
    return { postTitle, postDescription, postLink };
  });

  return {
    feed: { title, description },
    posts,
  };
};

export default parse;
