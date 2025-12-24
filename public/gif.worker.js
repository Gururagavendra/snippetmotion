// gif.js worker - this is loaded from CDN as a fallback
(function() {
  'use strict';
  
  // The actual worker code is loaded from the gif.js package
  // This file serves as a placeholder that imports the real worker
  importScripts('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js');
})();
