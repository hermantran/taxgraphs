module.exports = function(grunt) {

  grunt.config.set('json_bake', {
    dist: {
      files: {
        'data/2014.json': 'data/template.json'
      }
    }
  });

  grunt.loadNpmTasks('grunt-json-bake');
};
