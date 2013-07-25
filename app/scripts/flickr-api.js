/**
 * Provides Flickr Rest Api integration
 * @class FlickrApi
 * @uses settings
 * @uses mock.photos
 */
(function (app) {
    'use strict';

    /**
     * @class FlickrApi
     */
    app.flickr.classes.FlickrApi = function () {

        var callbacks, counter = 0, that = this;
        /**
         * todo: we need to delete callback once it is consumed
         * @global
         * @type {{}}
         */
        app.flickr.jsonpCallbacks = {};

        /**
         * @private
         * @type {{apiKey: string, endpoint: string}}
         */
        var config = {
            apiKey: '2cb78e1772b9f00c3b0ced01deb8811d',
            endpoint: 'http://api.flickr.com/services/rest/'
        };

        /**
         * Calls multiple api methods in order to fetch photos with details
         * @param {{text: string}} params
         * @param {number} pageSize
         * @param {Function} successCallback
         * @param {Function} progressUpdateCallback
         */
        this.search = function (params, pageSize, successCallback, progressUpdateCallback) {
            var url = '?method=flickr.photos.search';
            if (app.flickr.settings.isMocked) {
                successCallback(app.flickr.mock.photos);
                return;
            }
            //first call to fetch the list of photo ids
            sendJSONP(url, params, function (data) {
                console.log(data);
                if (data && data.photos && data.photos.photo) {
                    var photos = data.photos.photo;
                    var getPhotoInfoRequestCounter = 0;
                    var getPhotoInfoResponseCounter = 0;
                    var length = photos.length < pageSize ? photos.length : pageSize;
                    //result is empty
                    if(length===0){
                        successCallback(photos);
                        progressUpdateCallback(100);
                        return;
                    }
                    //I have ids, now its time to fetch details for each photos
                    //two request per each photo
                    for (var i = 0; i < length; i++) {
                        getPhotoInfoRequestCounter += 1;
                        (function (getPhotoInfoRequestCounter) {
                            var photo = photos[i];
                            that.getPhoto(photo.id, function (info, sizes) {
                                photo.info = info;
                                photo.sizes = sizes;
                                getPhotoInfoResponseCounter += 1;
                                if (length === getPhotoInfoResponseCounter) {
                                    console.log('data fetched');
                                    progressUpdateCallback(100);
                                    successCallback(photos.slice(0, length));
                                } else {
                                    progressUpdateCallback((getPhotoInfoResponseCounter / length) * 100);
                                }
                            })
                        })(getPhotoInfoRequestCounter)
                    }
                } else {
                    //api responded with error
                    successCallback([]);
                    progressUpdateCallback(100);
                    console.error('Error while retrieving data');
                }
            });
        };

        /**
         * Fetch photo details for particular photo, it calls two different apis methods in order to
         * fetch thumbnail - getSizes and photo details - getInfo
         * @required
         * @param photoId
         * @param successCallback
         */
        this.getPhoto = function (photoId, successCallback) {
            var info, sizes;
            var getInfoUrl = '?method=flickr.photos.getInfo';
            sendJSONP(getInfoUrl, {photo_id: photoId}, function (data) {
                info = data;
                if (info && sizes) {
                    successCallback(info, sizes);
                }
            });

            var getSizesUrl = '?method=flickr.photos.getSizes';
            sendJSONP(getSizesUrl, {photo_id: photoId}, function (data) {
                sizes = data;
                if (info && sizes) {
                    successCallback(info, sizes);
                }
            });
        }


        /**
         * Fetching data through injecting script node with JSONP url into DOM
         * @param url
         * @param params
         * @param successCallback
         * todo: error handling, what in case api respond with error code
         */
        function sendJSONP(url, params, successCallback) {
            var scriptEl = document.createElement('script');
            var urlString = config.endpoint + url + '&api_key=' + config.apiKey + '&format=json';
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    urlString = urlString + '&' + key + '=' + params[key];
                }
            }
            var uniqueName = 'callback' + counter;
            app.flickr.jsonpCallbacks[uniqueName] = successCallback;
            urlString += '&jsoncallback=' + 'window.app.flickr.jsonpCallbacks.' + uniqueName;

            scriptEl.src = urlString;
            scriptEl.async = true;

            counter += 1;

            document.getElementsByTagName('body')[0].appendChild(scriptEl);
        }

    };
})(window.app);