module.exports = function(grunt) {

  grunt.config.set('json_bake', {
    dist: {
      files: {
        'data/taxes.json': 'data/template.json'
      }
    }
  });

  grunt.loadNpmTasks('grunt-json-bake');
};
