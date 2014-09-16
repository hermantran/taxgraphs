module.exports = function(grunt) {

  grunt.config.set('connect', {
    dev: {
      options: {
        port: 1337,
        hostname: 'localhost',
        keepalive: true,
        directory: './'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
};
