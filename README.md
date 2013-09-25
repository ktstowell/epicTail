# epicTail.js

epicTail.js is a dependency-free tail-f simulator written in javascript that run in a web worker.

### Installation

Simply type `bower install epicTail` or clone this repo.

### How to use

* Copy either file in /build to a directory that gets served in your app. 
* In your place of choice, simple says something like:
  `var tail = new Worker('path/to/build/file');`
  To pass it options:
    `var opts = {
      file: <file from FormData>,
      interval: 1000
    }
    tail.postMessage(opts);`

  It is important to note that you should *only* call epicTail with `new` the *first* time you call it.
  This is because of the way the Web Worker API works. We have the same channels of communication for when we instantiate the webworker as when we want to simply pass data to it.
  To update the options for the instance of the web worker that you created with `new`, simply do `tail.postMessage(newOpts);`

### Options

* file

  File to parse as tail -f. Must be consumed through FileData API (i.e uploaded in a form by a user).
    			
* interval

  Time in MS in which to loop over file blobs. Default is 3000.
  
* action

  Method passed to worker for extra functionality. See available actions below.

* escapeText

  Use if wanting to parse HTML. Default is false.

### Methods

If no action method is passed, it simply returns the entire blob for that interval.

* match 

  Alows a user to match a string of text for against the current blob.

** query

   String that is used in the `match` action match in the file blobs.

** gmatch

   Global match, default false.
   
* stop
  Stops the web worker.

### Plans

Right now there's some relational disconnect in the way options are passed to the worker. Future release aim to build a system that makes sense.

Offer more functionality than essentially matching.

Provide some helper UI's that implement a basic parsing operation.
