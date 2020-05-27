// http://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form
module.exports = () => (input) => input
  .replace(/([A-Z])/g, ' $1')
  // uppercase the first character
  .replace(/^./, (str) => str.toUpperCase());
