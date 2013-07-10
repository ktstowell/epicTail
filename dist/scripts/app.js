'use strict';

/*global define */
define(['app'], function () {
    var input = document.getElementById('file'),
        opts = {};

    opts.action = 'match';
    opts.query = 'that';

    input.addEventListener('change', parseFile, false);

    function parseFile(e) {
      var seg;
      opts.file = e.target.files[0];

      var worker = new Worker('scripts/epicTail.js');

      worker.addEventListener('message', function(d) {
        if(d.data !== "" && d.data !== undefined) {
          $('body').append(d.data + "<br />");
        }
      }, false);
      
      worker.postMessage(opts);
    }

    return this;
});
