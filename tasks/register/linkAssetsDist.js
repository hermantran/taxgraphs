module.exports = function (grunt) {
  grunt.registerTask('linkAssetsDist', [
    'sails-linker:jsDist',
    'sails-linker:stylesDist',
    'sails-linker:tpl',
    'sails-linker:livereloadDist'
  ]);
};