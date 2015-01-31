/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */

var pkg = require('../package.json');

var cssProdFile = 'styles/main-' + pkg.version + '.min.css';
var jsProdFile = 'js/main-' + pkg.version + '.min.js';

// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
  'styles/pure/pure-min.css',
  'styles/pure/grids-responsive-min.css',
  'styles/**/*.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

  // Dependencies like jQuery, or Angular are brought in here
  // 'js/dependencies/**/*.js',

  // All of the rest of your client-side js files
  // will be injected here in no particular order.
  'js/main.js'
];


// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
  return 'dist/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
  return 'dist/' + path;
});
module.exports.livereloadFilesToInject = module.exports.jsFilesToInject;
module.exports.cssProdFile = 'dist/' + cssProdFile;
module.exports.jsProdFile = 'dist/' + jsProdFile;
