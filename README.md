# Flickr Module

This project contains simple text search module for searching publicly available flickr photos.
Integration with Flckr was done through REST JSONP Api. I'm using 3 different methods in order to fetch data with
details and thumbnail url. Search is limited to 10 rows, it can be easily extended in the future, this will require
implementation of the pagination mechanism.
Search form can be easily extended with adding new fields and binding them in View class.
For UI I was using SASS bootstrap.

## Project contents:
Reusable flickr module consists of following classes:

### flickr-api.js
Uses JSONP technique for fetching external resources. It would also extended to use another techniques like CORS or
ajax calls through server-side proxy.

### view.js
View class is a mix of view and presenter, it is responsible for:
 * controlling the user interaction, through simple event delegation mechanism
 * refreshing view when model change

## Addition information
The rest of documentation is provided within the sources.
I was using mostly yuidoc syntax for comments, however in some places it's mixed with jsdoc.



