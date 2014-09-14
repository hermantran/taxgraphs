module.exports = function(grunt) {

  grunt.config.set('connect', {
    dev: {
      options: {
        port: 8000,
        hostname: 'localhost',
        keepalive: true,
        directory: './'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
};
