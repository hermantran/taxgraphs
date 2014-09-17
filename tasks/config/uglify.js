/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function(grunt) {

  grunt.config.set('pkg', grunt.file.readJSON('package.json'));

  grunt.config.set('uglify', {
    js: {
      src: ['dist/js/main.js'],
      dest: 'dist/js/main.js',
      options: {
        banner: [
          '/*!',
          ' * <%= pkg.name %> v<%= pkg.version %>',
          ' * Copyright 2014 <%= pkg.author %>',
          ' * Licensed under <%= pkg.license %>',
          ' */',
          ''
        ].join('\n')
      }
    },
    jst: {
      src: ['dist/jst.js'],
      dest: 'dist/jst.js'
    },
    options: {
      mangle: true
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
};
