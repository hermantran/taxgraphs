module.exports = function(grunt) {

  grunt.config.set('jasmine', {
    spec: {
      src: 'dist/js/spec.js',
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
};
