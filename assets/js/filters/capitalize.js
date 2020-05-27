// http://codepen.io/WinterJoey/pen/sfFaK
module.exports = () => (input) => (input
  ? input.replace(
    /([^\W_]+[^\s-]*) */g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  )
  : '');
