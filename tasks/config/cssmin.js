/**
 * Compress CSS files.
 *
 * ---------------------------------------------------------------
 *
 * Minifies css files and places them into dist/min directory.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-cssmin
 */
module.exports = function(grunt) {

	grunt.config.set('cssmin', {
		dist: {
			src: ['dist/concat/production.css'],
			dest: 'dist/min/production.min.css'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
};
