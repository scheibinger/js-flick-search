/**
 * @module app.flickr
 */
(function (window) {
    window.app = {};
    window.app.flickr = {};
    window.app.flickr.classes = {};
    window.document.addEventListener('DOMContentLoaded', function () {
        'use strict';

        window.app.flickr.flickrApi = new app.flickr.classes.FlickrApi();
        window.app.flickr.view = new app.flickr.classes.View();

        /**
         *
         * @type {{isMocked: boolean}}
         */
        window.app.flickr.settings = {
            //useful for speeding up development, especially UI. Useful as well when external system is down
            isMocked:false
        };

        window.app.flickr.view.initialize();
    });
})(window);
