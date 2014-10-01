module.exports = function (grunt) {
  grunt.registerTask('default', [
    'compileAssets',
    'linkAssets',
    'sails-linker:livereload',
    'connect:dev',
    'watch'
  ]);
};
