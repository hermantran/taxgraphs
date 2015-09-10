module.exports = function(grunt) {

  grunt.config.set('preprocessTax', {
    dist: {
      files: {
        'data/taxes.json': ['data/taxes.json']
      }
    }
  });
};
