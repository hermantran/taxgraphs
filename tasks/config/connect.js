module.exports = function(grunt) {

  grunt.config.set('connect', {
    options: {
      port: 1337,
      hostname: 'localhost',
      directory: './'
    },
    dev: {
      
    },
    dist: {
      options: {
        keepalive: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
};
