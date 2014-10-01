module.exports = function (grunt) {
  grunt.registerTask('dist', [
    'compileAssets',
    'linkAssets',
    'sails-linker:livereloadDist',
    'uglify'
  ]);
};
