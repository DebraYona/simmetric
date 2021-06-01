/* eslint-disable import/prefer-default-export */
export function groupBy(key, array) {
  return array.reduce((acc, obj) => {
    const property = obj[key];
    acc[property] = acc[property] || [];
    acc[property].push(obj);
    return acc;
  }, {});
}
