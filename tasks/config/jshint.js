module.exports = function(grunt) {

  grunt.config.set('jshint', {
    dev: ['assets/js/**/*.js', '!assets/js/lib/**/*.js'],
    options: {
      jshintrc: '.jshintrc'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
