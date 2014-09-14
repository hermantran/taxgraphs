module.exports = function (grunt) {
  grunt.registerTask('compileJs', [
    // 'jshint:dev',
    'browserify:dev',
    'uglify:dist'
  ]);
};
