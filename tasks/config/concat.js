/**
 * Concatenate files.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * dist/contact directory
 * [concat](https://github.com/gruntjs/grunt-contrib-concat)
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-concat
 */
module.exports = function(grunt) {

  grunt.config.set('concat', {
    css: {
      src: require('../pipeline').cssFilesToInject,
      dest: require('../pipeline').cssProdFile
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
};
