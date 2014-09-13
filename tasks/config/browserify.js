module.exports = function(grunt) {

  grunt.config.set('browserify', {
    dev: {
      files: {
        'dist/js/main.js': ['assets/js/main.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};
