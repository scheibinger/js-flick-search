'use strict';

var express = require("express");
var util = require('util');
var oauth = require('oauth');

var app = module.exports = express.createServer();

// Get your credentials here: https://dev.twitter.com/apps
var _twitterConsumerKey = "rMSoEBtxOarcP2QEfLWcGA";
var _twitterConsumerSecret = "EO5MboqZAAtwjRTJ4mkz7va8spcFChfuoEw5uVgIQU";

var consumer = new oauth.OAuth(
    "https://twitter.com/oauth/request_token",
    "https://twitter.com/oauth/access_token",
    _twitterConsumerKey,
    _twitterConsumerSecret,
    "1.0A",
    "http://127.0.0.1:9000/sessions/callback",
    "HMAC-SHA1"
);

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "very secret" }));

});


app.get('/sessions/connect', function (req, res) {
    consumer.getOAuthRequestToken(function (error, oauthToken, oauthTokenSecret, results) {
        if (error) {
            res.send("Error getting OAuth request token : " + util.inspect(error), 500);
        } else {
            req.session.oauth = {};
            req.session.oauth.token = oauthToken;
            req.session.oauth.token_secret = oauthTokenSecret;
            res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + oauthToken);
        }
    });
});

app.get('/sessions/callback', function (req, res) {
    consumer.getOAuthAccessToken(
        req.session.oauth.token,
        req.session.oauth.token_secret,
        req.query.oauth_verifier,
        function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
            if (error) {
                res.send("Error getting OAuth access token : " + util.inspect(error) + "[" + oauthAccessToken + "]" +
                    "[" + oauthAccessTokenSecret + "]" + "[" + util.inspect(results) + "]", 500);
            } else {
                req.session.oauth.access_token = oauthAccessToken;
                req.session.oauth.access_token_secret = oauthAccessTokenSecret;

                res.redirect('/index.html');
            }
        });
});

var callTwitterApi = function (req, res, url, method) {
    if (req.session.oauth && req.session.oauth.access_token) {
        consumer.getProtectedResource(
            url,
            method,
            req.session.oauth.access_token,
            req.session.oauth.access_token_secret,
            function (err, data, response) {
                if (err) {
                    res.send(JSON.stringify(err));
                } else {
                    res.send(data);
                }
            });
    } else {
        res.redirect('/sessions/connect');
    }
};

/**
 * Returns twitter User Details if oauth token is valid
 */
app.get('/', function (req, res) {
    if (req.session.oauth && req.session.oauth.access_token) {
        res.redirect('/index.html')
    } else {
        res.redirect('/sessions/connect');
    }
});

/**
 * Returns twitter User Details if oauth token is valid
 */
app.get('/api/get_user', function (req, res) {
    callTwitterApi(req, res, 'https://api.twitter.com/1.1/account/verify_credentials.json', 'GET');
});

/**
 * Returns twitter User Details if oauth token is valid
 */
app.get('/api/user_timeline', function (req, res) {
    callTwitterApi(req, res, 'https://api.twitter.com/1.1/statuses/user_timeline.json', 'GET');
});

/**
 * Returns twitter User Details if oauth token is valid
 */
app.get('/api/home_timeline', function (req, res) {
    callTwitterApi(req, res, 'https://api.twitter.com/1.1/statuses/home_timeline.json', 'GET');
});

/**
 * Simple Proxy for twitter API calls
 */
app.get('/api/:url/:method', function (req, res) {
    if (req.params.url && req.params.method)
        callTwitterApi(req, res, req.params.url, req.params.method);
    else
        res.send('url and method params are required');
});


/*app.get('*', function (req, res) {
 res.redirect('/home');
 });*/

exports.express = express;