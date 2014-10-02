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
          cwd: './node_modules/purecss',
          src: [
            'pure-min.css',
            'grids-responsive-min.css'
          ],
          dest: 'dist/styles/pure'
        }, {
          expand: true,
          cwd: './assets',
          src: [
            '**/*.!(coffee|less|json|html)',
            '!js/**',
          ],
          dest: 'dist'
        }
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
