module.exports = function(grunt) {

  grunt.config.set('browserify', {
    dev: {
      files: {
        'dist/js/main.js': ['assets/js/main.js'],
      },
      options: {
        transform: [['babelify', { 
          presets: ['@babel/preset-env'] 
        }]],
      },
    },
    spec: {
      src: ['spec/**/*.js'],
      dest: 'dist/js/spec.js',
      options: {
        transform: [['babelify', { 
          presets: ['@babel/preset-env'] 
        }]],
      },
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};
