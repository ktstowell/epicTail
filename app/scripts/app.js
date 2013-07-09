/*global define */
define([], function () {
    'use strict';
    
    var input = document.getElementById('file'),
        opts = {};

    input.addEventListener('change', parseFile, false);

    function parseFile(e) {
      var file = e.target.files[0],
          seg;

      var worker = new Worker('scripts/epicTail.js');

      worker.addEventListener('message', function(d) {
        if(d.data !== "" && d.data !== undefined) {
          seg = d.data.split(/\r?\n/);
          for(var i=0;i<seg.length;i++) {
            $('body').append(seg[i]+"<br />");
          }
        }
      }, false);
      
      worker.postMessage(file);
    }

    return this;
});
