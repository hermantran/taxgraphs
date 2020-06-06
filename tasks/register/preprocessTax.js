/**
 * Adapated from grunt-minjson:
 * https://github.com/shama/grunt-minjson/blob/master/tasks/minjson.js
 */

module.exports = function(grunt) {

  var jsonminify = require('jsonminify'),
      path = require('path'),
      lodash = require('lodash'),
      TaxService = require('../../assets/js/services/taxService'),
      taxService = new TaxService(lodash);

  grunt.registerMultiTask('preprocessTax', 'Preprocess tax data', function() {
    this.files.forEach(function(file) {
      var dest = path.normalize(file.dest),
          srcFiles = grunt.file.expand(file.src),
          src = [],
          errors = [];

      srcFiles.forEach(function(filepath) {
        var data = JSON.parse(grunt.file.read(filepath));
        var processedData = taxService.preprocessTaxes(data);

        try {
          // minify json
          src.push(jsonminify(JSON.stringify(processedData)));
        } catch (err) {
          errors.push(err.message + ' in ' + filepath);
        }

        if (errors.length < 1) {
          // wrap concat'd files in brackets
          if (src.length > 1) { src = '[' + src.join(',') + ']'; }
          else { src = src[0]; }
          grunt.file.write(dest, src);
          grunt.log.writeln('File "' + dest + '" created.');
        } else {
          // display errors
          errors.forEach(function(msg) { grunt.log.error(msg); });
        }
      });

    });
  });
};