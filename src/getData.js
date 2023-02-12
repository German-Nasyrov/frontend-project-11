import axios from 'axios';

const getData = (url) => axios
  .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .catch((error) => { throw new Error(error); });

export default getData;
