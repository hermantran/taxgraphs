module.exports = function (grunt) {
  grunt.registerTask('compileAssets', [
    'clean:dev',
    'copy:dev',
    'ngtemplates',
    'less:dev',
    'eslint:dev',
    'browserify:dev',
    'json_bake:dist',
    'preprocessTax:dist'
  ]);
};
