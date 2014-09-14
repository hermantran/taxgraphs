module.exports = function(grunt) {

  grunt.config.set('preprocess-tax', {
    dev: {
      files: {
        'dist/data/taxes.json': ['assets/data/taxes.json']
      }
    }
  });
};
