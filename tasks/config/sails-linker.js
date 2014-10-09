/**
 * Autoinsert script tags (or other filebased tags) in an html file.
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags for javascript files and <link> tags
 * for css files.  Also automatically links an output file containing precompiled
 * templates using a <script> tag.
 *
 * For usage docs see:
 *    https://github.com/Zolmeister/grunt-sails-linker
 *
 */
module.exports = function(grunt) {

  grunt.config.set('sails-linker', {
    jsDev: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="dist%s"></script>',
        appRoot: 'dist'
      },

      files: {
        '*.html': require('../pipeline').jsFilesToInject,
      }
    },

    jsDist: {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="dist%s"></script>',
        appRoot: 'dist'
      },

      files: {
        '*.html': require('../pipeline').jsProdFile
      }
    },

    stylesDev: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="dist%s">',
        appRoot: 'dist'
      },

      files: {
        '*.html': require('../pipeline').cssFilesToInject,
      }
    },

    stylesDist: {
      options: {
        startTag: '<!--STYLES-->',
        endTag: '<!--STYLES END-->',
        fileTmpl: '<link rel="stylesheet" href="dist%s">',
        appRoot: 'dist'
      },

      files: {
        '*.html': require('../pipeline').cssProdFile,
      }
    },

    tpl: {
      options: {
        startTag: '<!--TEMPLATES-->',
        endTag: '<!--TEMPLATES END-->',
        fileTmpl: '<script src="dist%s"></script>',
        appRoot: 'dist'
      },
      
      files: {
        '*.html': ['dist/jst.js'],
      }
    },

    livereloadDev: {
      options: {
        startTag: '<!--LIVERELOAD-->',
        endTag: '<!--LIVERELOAD END-->',
        fileTmpl: '<script src="//localhost:35729/livereload.js"></script><!--%s-->',
        appRoot: 'dist'
      },

      files: {
        '*.html': require('../pipeline').livereloadFilesToInject
      }
    },

    livereloadDist: {
      options: {
        startTag: '<!--LIVERELOAD-->',
        endTag: '<!--LIVERELOAD END-->',
        fileTmpl: '',
        appRoot: 'dist'
      },

      files: {
        '*.html': []
      }
    }
  });

  grunt.loadNpmTasks('grunt-sails-linker');
};
