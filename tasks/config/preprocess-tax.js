module.exports = function(grunt) {

  grunt.config.set('preprocess-tax', {
    dist: {
      files: {
        'dist/data/taxes.json': ['assets/data/taxes.json']
      }
    }
  });
};
