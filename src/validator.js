import * as yup from 'yup';

const validate = (link, collection) => {
  const schemaStr = yup.string().required().url().trim();
  const schemaMix = yup.mixed().notOneOf([collection]);
  return schemaStr.validate(link).then((url) => schemaMix.validate(url));
};

export default validate;
