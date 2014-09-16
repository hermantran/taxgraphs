/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function(grunt) {

  grunt.config.set('uglify', {
    js: {
      src: ['dist/js/main.js'],
      dest: 'dist/js/main.min.js'
    },
    jst: {
      src: ['dist/js/jst.js'],
      dest: 'dist/js/jst.js'
    },
    options: {
      mangle: true
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
};
