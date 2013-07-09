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
 * The event handler for the worker to be able to pass data back to the main thread.
 * @param  {[type]} e event object
 * @param {opts}   plugin options from the dom
 */
worker.addEventListener('message', function(e, opts) {
  new epicTail(e, opts);
}, false);

/*******************************************************************************************************
 * EPIC TAIL CLASS
 *******************************************************************************************************
 * @description
 * @dependency
 * @author         
 */
var epicTail = function(e, opts) {
  var self = this;
  
  /**
   * Options
   * @type {[type]}
   */
  opts = opts || {};

  /**
   * Event Target
   * @type {[type]}
   */
  this.target = e.target || '';

  /**
   * File
   * @type {[type]}
   */
  this.file = e.data || false;

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

  /**
   * Blob beginning
   * @type {Number}
   */
  this.fBeg = 0;

  /**
   * File end
   */
  this.fEnd;

  // Launch the reader
  (this.file) ? this.read() : this.post('no file');
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
        // Send the data back to the main thread
        worker.postMessage(self.reader.result);
        // set the new starting pointer
        self.fBeg = self.fEnd+1;
      }
    }
  }, self.opts.interval);
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