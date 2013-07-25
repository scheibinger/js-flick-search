/**
 * View class is a mix of view and presenter, it is responsible for:
 *  - controlling the user interaction, through simple event delegation mechanism
 *  - refreshing view when model change
 * @class View
 */
(function (app) {
    if (!(app && app.flickr && app.flickr.classes)) {
        throw new Error('app.flickr.classes namespace is not defined');
    }

    app.flickr.classes.View = function () {
        if (!(app.flickr.flickrApi)) {
            throw new Error('app.flickr.flickrApi instance is not defined');
        }

        var flickrService = app.flickr.flickrApi;
        var elId = 'flickr-view';
        //prevents running new search when it's already running
        var blockInteraction = false;

        //binding DOM elements to local variables
        var els = {
            searchForm: {
                text: document.querySelector('#flickr-search-panel input:nth-child(1)')
            },
            searchResults: document.querySelector('#flickr-search-results ul'),
            progressBar: document.querySelector('#flickr-search-right-panel .progress .bar')
        };

        /**
         * List of handled events with attached handlers
         * @type {Object}
         */
        var events = {
            'button.flickr-search-btn': {
                events: ['click'],
                handler: onSearchClicked
            }
        }

        /**
         * Handler for Search Button click event
         * @param e
         */
        function onSearchClicked(e) {
            console.log('searching photos');
            blockInteraction = true;
            var params = {};
            if (els.searchForm.text.value) {
                params.text = els.searchForm.text.value
            }

            //reset progress bar
            els.progressBar.parentNode.style.display = 'block';
            els.progressBar.style.width = '0';
            els.searchResults.innerHTML = '';

            var updateProgressCallback = function (percentComplete) {
                els.progressBar.style.width = percentComplete + '%';
            }

            var dataFetchedCallback = function (photos) {
                console.log('data fetched', photos);
                els.progressBar.parentNode.style.display = 'none';
                renderSearchResults(photos);
                blockInteraction = false;
            }

            flickrService.search(params, 10, dataFetchedCallback, updateProgressCallback);
        }

        /**
         * Responsible for rendering entire list of search results
         * @param photos
         */
        function renderSearchResults(photos) {
            var content = '';
            for (var i = 0, l = photos.length; i < l; i++) {
                content += renderPhotoItem(photos[i]);
            }
            els.searchResults.innerHTML = content;
        }

        /**
         *
         * @param photo
         * @returns {string}
         */
        function renderPhotoItem(photo) {
            //this template looks weird, it's better to keep such things in external e.g. underscore templates
            return '<li class="media"> ' +
                '<a class="pull-left" href="#"> ' +
                '<img class="media-object" src="' + photo.sizes.sizes.size[2].source + '"> ' +
                '</a> ' +
                '<div class="media-body"> ' +
                '<h4 class="media-heading">' + photo.title + '</h4>' +
                '<span><strong>From: </strong>' + photo.info.photo.owner.username + '</span>' +
                '<span class="pull-right"><strong>Date taken: </strong>' + photo.info.photo.dates.taken + '</span>' +
                '</div> ' +
                '</li>';
        }

        /**
         * Implements simple events delegation
         */
        function delegateEvents() {
            var viewEl = document.getElementById(elId);

            var matchesSelector = viewEl.matchesSelector
                || viewEl.oMatchesSelector
                || viewEl.mozMatchesSelector
                || viewEl.webkitMatchesSelector
                || viewEl.msMatchesSelector;

            viewEl.addEventListener('click', function (e) {
                if (blockInteraction) {
                    return;
                }
                var element = e.target;

                for (var key in events) {
                    if (events.hasOwnProperty(key) && matchesSelector.call(e.target, key)) {
                        e.stopPropagation();
                        events[key].handler.call(e);
                        return;
                    }
                }
            });
        }

        //public interface
        return {
            /**
             * Initialize view
             */
            initialize: function () {
                delegateEvents();

                //if mock mode is enabled we load some dummy data
                if (app.flickr.settings.isMocked) {
                    flickrService.search({text: 'sanok'}, 10, function (photos) {
                        console.log('data fetched', photos);
                        renderSearchResults(photos);
                    });
                }
            }
        }
    }
})(window.app);