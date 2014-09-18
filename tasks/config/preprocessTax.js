module.exports = function(grunt) {

  grunt.config.set('preprocessTax', {
    dist: {
      files: {
        'dist/data/taxes.json': ['assets/data/taxes.json']
      }
    }
  });
};
