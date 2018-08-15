# Angular Bing Maps
[![Join the chat at https://gitter.im/Credera/angular-bing-maps](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Credera/angular-bing-maps?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Project Status
Angular Bing Maps is a project that Credera developed as part of a client engagement. All requirements / features were initially driven by client needs, but we are now accepting features from the community. Feel free to submit issues and feature requests. See "Contributing" section below for instructions on how to make changes and submit PRs.

## Getting Started
  1. Obtain source code for angular-bing-maps
    * Via Bower `bower install angular-bing-maps --save`
    * Via git `git clone git@github.com:Credera/angular-bing-maps.git`
  2. Include /dist/angular-bing-maps.min.js in your HTML source
    * `<script type="text/javascript" src="bower_components/angular-bing-maps/dist/angular-bing-maps.min.js"></script>`
  3. Include Bing Maps' Javascript file in your HTML source
    * `<script charset="UTF-8" type="text/javascript" src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"></script>`
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
  * [`<venue-map>`](example/bing-venue-map-directive.html)
  * [`<geo-json>`](example/geo-json-directive.html) :star:
    * Using Earthware Ltd.'s Bing Maps GeoJSON Module from http://bingmapsv7modules.codeplex.com/wikipage?title=GeoJSON%20Module
  * [`<wkt>`](wkt-directive.html) :star:[(Well-Known Text)](http://en.wikipedia.org/wiki/Well-known_text)
    * Using Ricky Brundritt's Bing Maps WKT Read/Write Module http://bingmapsv7modules.codeplex.com/wikipage?title=Well%20Known%20Text%20Reader%2fWriter
  * [`<drawing-tools>`](drawing-tools-directive.html):star:
    * Using Ricky Brundritt's Bing Maps Drawing Tools Module https://bingmapsv7modules.codeplex.com/wikipage?title=Drawing%20Tools%20Module&version=1

:star: - Third party modules must be manually included in addition to angular-bing-maps.js. Please use modules found inside this repository under /BingMapModules/{{moduleName}}

## Contributing
Feel free to submit PR's for features, but please submit all PR's as candidates for the "develop" branch. Our "master" branch contains the latest stable release.
### Developer Setup
To begin contributing to angular-bing-maps:
 1. Fork it
 2. Clone your fork
 3. Checkout the "develop" branch
   * `git checkout develop`
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
