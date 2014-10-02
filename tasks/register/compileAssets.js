module.exports = function (grunt) {
  grunt.registerTask('compileAssets', [
    'clean:dev',
    'copy:dev',
    'jst:dev',
    'less:dev',
    'jshint:dev',
    'browserify:dev',
    'json_bake:dist',
    'preprocessTax:dist'
  ]);
};
