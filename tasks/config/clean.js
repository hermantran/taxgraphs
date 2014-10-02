/**
 * Clean files and folders.
 *
 * ---------------------------------------------------------------
 *
 * This grunt task is configured to clean out the contents in the dist of your
 * sails project.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-clean
 */
module.exports = function(grunt) {

  grunt.config.set('clean', {
    dev: ['dist/**'],
    dist: [
      'dist/js/**/*.js',
      '!dist/js/*.min.js',
      'dist/styles/*/**',
      'dist/styles/*.css',
      '!dist/styles/*.min.css'
    ]
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
};
