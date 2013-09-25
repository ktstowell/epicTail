module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/epicTail.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      build: {
        src: 'src/epicTail.js',
        dest: 'build/epicTail.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('build', 
    [
      'uglify',
      'copy'
    ]
  );

};