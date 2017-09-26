# Angular Bing Maps
[![Join the chat at https://gitter.im/Credera/angular-bing-maps](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Credera/angular-bing-maps?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Project Status
Angular Bing Maps is a project that Credera developed as part of a client engagement. All requirements / features were initially driven by client needs, but we are now accepting features from the community. Feel free to submit issues and feature requests. See "Contributing" section below for instructions on how to make changes and submit PRs.

## Getting Started
  1. Obtain source code for angular-bing-maps
    * Via Bower `bower install angular-bing-maps --save`
    * Via git `git clone git@github.com:Credera/angular-bing-maps.git`
  2. Include Bing Maps' Javascript file in your HTML source
    * `<script charset="UTF-8" type="text/javascript" src="//www.bing.com/api/maps/mapcontrol?callback=initApp" async defer></script>`
    * IMPORTANT: Before using any of the directives in this project, you must wait for the Bing Maps library to finish loading. Use the `?callback=` parameter to determine when the Bing Maps API is ready to use.
  3. Include /dist/angular-bing-maps.min.js in your HTML source
    * `<script type="text/javascript" src="bower_components/angular-bing-maps/dist/angular-bing-maps.min.js"></script>`
  4. Include 'angularBingMaps' module in your angular app dependencies
    * `var myApp = angular.module('yourAppName', ['angularBingMaps']);`
  5. Add your parent `<bing-map></bing-map>` directive into your HTML with your Bing Maps API credentials
    * Please see `/example/bing-map-directive.html` for a basic example. 
    * NOTE: Please register for your own Bing Maps API key at https://www.bingmapsportal.com. Login with your Windows Live account and click 'My Account' -> 'Create or view your keys'

## Documentation
Proper documentation is in our road map, but currently not implemented. Please view [/examples](example) for example usage of each directive.

### List of available directives
  * [`<bing-map>`](example/bing-map-directive.html)
  * [`<pushpin>`](example/pushpin-directive.html)
  * [`<infobox>`](example/infobox-directive.html)
  * [`<abm-polygon>`](example/polygon-directive.html)
  * [`<polyline>`](example/polyline-directive.html)
  * [`<tile-layer>`](example/tile-layer-directive.html)
  * [`<geo-json>`](example/geo-json-directive.html)
  * [`<wkt>`](wkt-directive.html) [(Well-Known Text)](http://en.wikipedia.org/wiki/Well-known_text)
  * [`<drawing-tools>`](drawing-tools-directive.html)

## Contributing
Feel free to submit PR's for features, but please submit all PR's as candidates for the "develop" branch. Our "master" branch contains the latest stable release.

### Developer Setup
To begin contributing to angular-bing-maps:
 1. Fork it
 2. Clone your fork
 3. Checkout the "develop" branch
   * `git checkout devlop`
 4. Create a new feature branch for your changes off the develop branch
   * `git branch my-super-cool-feature`
 5. Install NodeJS developer dependencies
   * `npm install`
 6. Install bower developer dependencies
   * `bower install`
 7. Run the gulp build process to automatically lint and compile the library as you make changes
   * `gulp`
 8. For any signifcant feature additions, please update the documentation / examples to illustrate your new feature to potential users
 5. Make your changes and commit them to your feature branch
   * Note: You will have pending changes to the dist/ directory where the compiled assets are located. Feel free to check these in if you like. I will do my best to ensure the "develop" branch always contains the latest build before pushing to the central repository
 6. Submit a PR as a candidate for the "develop" branch of the central repository. Please do not submit PR's as candidates for "master". They will be declined.
