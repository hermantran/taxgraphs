module.exports = function(grunt) {

  grunt.config.set('eslint', {
    dev: [
      'assets/js/**/*.js',
      '!assets/js/lib/**/*.js',
      '!assets/js/templates.js',
    ],
    options: {
      configFile: './.eslintrc.js',
    },
  });

  grunt.loadNpmTasks('grunt-eslint');
};
