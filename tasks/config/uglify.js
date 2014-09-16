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
    dist: {
      src: ['dist/js/main.js'],
      dest: 'dist/js/main.min.js'
    },
    options: {
      mangle: true
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
};
