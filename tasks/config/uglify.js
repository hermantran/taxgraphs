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

  grunt.config.set('uglify', {
    js: {
      src: ['dist/js/main.js'],
      dest: require('../pipeline').jsProdFile,
      options: {
        banner: [
          '/*!',
          ' * <%= pkg.name %> v<%= pkg.version %>',
          ' * Copyright 2014-2015 <%= pkg.author %>',
          ' * Licensed under the <%= pkg.license %> license.',
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
