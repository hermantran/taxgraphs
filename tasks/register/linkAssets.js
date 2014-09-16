module.exports = function (grunt) {
  grunt.registerTask('linkAssets', [
    'sails-linker:js',
    'sails-linker:styles',
    'sails-linker:tpl'
  ]);
};
