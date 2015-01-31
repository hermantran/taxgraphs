module.exports = function(grunt) {

  grunt.config.set('ngtemplates', {
    taxApp: {
      src: 'assets/templates/**/*.html',
      dest: 'assets/js/templates.js',
      options: {
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-angular-templates');
};
