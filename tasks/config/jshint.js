module.exports = function(grunt) {

  grunt.config.set('jshint', {
    dev: ['assets/js/**/*.js', '!assets/js/dependencies/**/*.js'],
    options: {
      jshintrc: 'assets/js/.jshintrc'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
