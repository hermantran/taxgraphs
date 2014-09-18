/**
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * ---------------------------------------------------------------
 *
 * Watch for changes on
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function(grunt) {

  grunt.config.set('watch', {
    js: {
      files: ['assets/js/**/*.js'],
      tasks: ['jshint:dev', 'browserify:dev']
    },
    styles: {
      files: ['assets/styles/**/*.less'],
      tasks: ['less:dev']
    },
    tpl: {
      files: ['assets/templates/**/*.html'],
      tasks: ['jst:dev']
    },
    json: {
      files: ['assets/data/**/*.json'],
      tasks: ['preprocessTax:dist']
    },
    pipeline: {
      files: ['tasks/pipeline.js'],
      tasks: ['linkAssets']
    },
    options: {
      livereload: true
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
};
