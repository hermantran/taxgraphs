/**
 * Copy files and folders.
 *
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Copies all directories and files, exept coffescript and less fiels, from the sails
 * assets folder into the dist directory.
 *
 * # build task config
 * Copies all directories nd files from the dist directory into a www directory.
 *
 * For usage docs see:
 *    https://github.com/gruntjs/grunt-contrib-copy
 */
module.exports = function(grunt) {

  grunt.config.set('copy', {
    dev: {
      files: [
        {
          expand: true,
          cwd: './assets/bower_components',
          src: [
            'pure/pure-min.css',
            'pure/grids-responsive-min.css'
          ],
          dest: 'dist/styles'
        }, {
          expand: true,
          cwd: './assets',
          src: [
            '**/*.!(coffee|less|json|html)',
            '!js/**',
            '!bower_components/**/*'
          ],
          dest: 'dist'
        }
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
