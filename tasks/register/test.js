module.exports = function (grunt) {
  grunt.registerTask('test', [
    'browserify:spec',
    'jasmine'
  ]);
};
