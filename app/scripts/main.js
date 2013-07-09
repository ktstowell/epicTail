require.config({
    paths: {
        jquery: 'libs/jquery',
        modernizr: 'libs/custom.modernizr'
    },
});

require(['app'], function (app, $) {
    'use strict';
    // use app here
    console.log(app);
});
