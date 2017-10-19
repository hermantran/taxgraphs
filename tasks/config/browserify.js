module.exports = function(grunt) {

  grunt.config.set('browserify', {
    dev: {
      files: {
        'dist/js/main.js': ['assets/js/main.js'],
      }
    },
    spec: {
      src: ['spec/**/*.js'],
      dest: 'dist/js/spec.js'
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};
