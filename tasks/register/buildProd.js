module.exports = function (grunt) {
  grunt.registerTask('buildProd', [
    'compileAssets',
    'concat',
    'uglify',
    'linkAssetsBuildProd',
    'clean:build',
    'copy:build'
  ]);
};
