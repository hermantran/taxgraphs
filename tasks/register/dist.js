module.exports = function (grunt) {
  grunt.registerTask('dist', [
    'compileAssets',
    'linkAssets',
    'uglify'
  ]);
};
