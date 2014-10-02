module.exports = function (grunt) {
  grunt.registerTask('dist', [
    'compileAssets',
    'uglify',
    'concat',
    'linkAssetsDist',
    'clean:dist'
  ]);
};
