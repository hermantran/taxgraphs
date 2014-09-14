module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'jst:dev',
		'less:dev',
		'copy:dev',
    'preprocess-tax:dev',
		'browserify:dev',
    'uglify:dist'
	]);
};
