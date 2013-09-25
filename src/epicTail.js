'use strict';

/*******************************************************************************************************
 * EPIC TAIL
 *******************************************************************************************************
 *
 * @description dynamic file reading that simulates tail -f
 * @dependencies
 * @injections
 * @author Ken Stowell
 */

/**
 * WORKER OBJECT
 * @description the current instance of the worker
 */
var worker = this;

/**
 * IS INSTANTIATED
 * @type {Boolean}
 */
var instance = false;

/**
 * The event handler for the worker to be able to pass data back to the main thread.
 * @param  {[type]} e event object
 * @param {opts}   plugin options from the dom
 */
worker.addEventListener('message', function(e) {
  (!instance)? new epicTail(e) : instance.updateOpts(e);
}, false);

/*******************************************************************************************************
 * EPIC TAIL CLASS
 *******************************************************************************************************
 * @description
 * @dependency
 * @author         
 */
var epicTail = function(e) {
  var self = this;
  
  /**
   * Options
   * @type {[type]}
   */
  var opts = e.data || {};

  /**
   * Event Target
   * @type {[type]}
   */
  this.target = e.target || '';

  /**
   * File
   * @type {[type]}
   */
  this.file = e.data.file || false;

  /**
   * Default options
   * @type {Object}
   */
  this.defaults = {};

  /**
   * Default string
   * @type {Boolean}
   */
  this.defaults.string = false;

  /**
   * Default Interval
   * @type {Number}
   */
  this.defaults.interval = 3000;

  this.defaults.minBlobSize = 100;

  this.defaults.fBeg = 0;

  this.defaults.showFailed = false;

  this.defaults.matchAll = false;

  this.defaults.escapeText = false;

  /**
   * Callback
   * @return {[type]} [description]
   */
  this.defaults.callback = function() {};

  /**
   * Extended Options
   * @type {[type]}
   */
  this.opts = this.extend(self.defaults, opts);

  /**
   * File Reader instance
   * @type {FileReader}
   */
  this.reader = new FileReader();

  /**
   * Postmessage
   * @type {[type]}
   */
  this.post = worker.postMessage;

  this.opts.fBeg = (this.file.size - (this.file.size * .10) < this.opts.minBlobSize) ?
    this.file.size - (this.file.size * .10) : this.file.size - this.opts.minBlobSize;
  /**
   * Blob beginning
   * @type {Number}
   */
  this.fBeg = this.opts.fBeg;

  /**
   * File end
   */
  this.fEnd;

  // Now that all the data has been set
  // flag the class to preserve memory
  instance = this;

  // Launch the reader
  (this.file) ? this.read() : function() {throw JSON.stringify('no file')};
};

/**
 * READ
 * @description Creates a loop to read through file chunks and send them back to the worker.
 */
epicTail.prototype.read = function() {
  var self = this,
      blob;

  // Self executing interval to parse file chunks
  var readLoop = setInterval(function() {
    // set the new end file at the begginning of each loop
    self.fEnd = self.file.size-1;
    // set the blob size.
    blob = self.file.slice(self.fBeg, self.fEnd + 1);
    // Pass blog into the reader
    self.reader.readAsText(blob);
    // Onloadend runs when the data passed into the reader is totally done loading.
    self.reader.onloadend = function() {
      // If the readystate is "done"
      if(self.reader.readyState === 2) {
        switch(self.opts.action) {
          case 'match': self.match(self.reader.result);
            break;
          case 'stop' : self.close();
            break;
          default: worker.postMessage(self.reader.result);
            break;
        }
        // set the new starting pointer
        self.fBeg = self.fEnd+1;
      }
    }
  }, self.opts.interval);
};

epicTail.prototype.match = function(res) {
  var self = this,
      seg = res.split(/\r?\n/),
      re = new RegExp(self.opts.query, "g"),
      match;

  for(var i=0; i<seg.length; i++) {
    if(this.opts.query && this.opts.query !== '' && this.opts.query !== undefined) {
      match = seg[i].match(re);
      if(match !== null && match.length !== 0) {
        (self.opts.escapeText)? seg[i] = self.html(seg[i]) : '';
        if(self.opts.gmatch) {
          for(var j=0; j<match.length; j++) {
            // This will post back for every occurence
            worker.postMessage({match: 'true', blob: seg[i], size: [self.fBeg, self.fEnd, j+1]});
          }
        } else {
          // this will post back once per line
          worker.postMessage({match: 'true', blob: seg[i], size: [self.fBeg, self.fEnd]});
        }
      } else {
        // No match
        if(this.opts.showFailed) {
          worker.postMessage({match: 'false', blob: seg[i], size: [self.fBeg, self.fEnd]});
        }
      }
    } else {
      if(this.matchAll) {
        worker.postMessage({match: 'true', blob: seg[i], size: [self.fBeg, self.fEnd], query: self.opts.query});
      }
    }
  }
};

/**
 * EXTEND
 * @description simple, non jQuery extend function.
 * @param  {[type]} obj1 original object
 * @param  {[type]} obj2 new object to merge into original
 * @return {[type]} src newly merged object
 */
epicTail.prototype.extend = function(obj1, obj2) {
  var src = obj1 || {},
      ext = obj2 || {};

  (function copy(src, ext) {
      for(var key in ext) {
        if(typeof src[key] === 'object') {
          // if a child is an opject, recurse
          copy(src[key], ext[key]);
        } else {
          src[key] = ext[key];
        }
      }
     })(src, ext);

     // return modified src
     return src;
}

/**
 * UPDATE OPTS
 * @param  {[type]} opts [description]
 * @return {[type]}      [description]
 */
epicTail.prototype.updateOpts = function(opts) {
  this.opts = this.extend(this.opts, opts.data);
};

/**
 * HTML
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
epicTail.prototype.html =  function(html) {
  html = html.replace( /[<>]/g, function( match ) {
      if( match === '<' ) return '&lt;';
      else return '&gt;';
  });
  return html;
}