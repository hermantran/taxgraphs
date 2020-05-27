module.exports = function(grunt) {

  grunt.config.set('jasmine', {
    spec: {
      src: 'dist/js/spec.js',
      options: {
        helpers: [
          './node_modules/babel-register/lib/node.js',
        ],
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
};
