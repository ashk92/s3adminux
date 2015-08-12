'use strict';

angular
  .module('s3adminApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngFileUpload',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/buckets/:bucketName', {
        templateUrl: 'views/explorer.html',
        controller: 'ExplorerCtrl'
      })
      .when('/buckets',{
        templateUrl: 'views/buckets.html',
        controller: 'BucketsCtrl',
      })
      .when('/admin',{
        templateUrl: 'views/admin.html',
        controller: 'AdminCtrl',
      })
      .otherwise({
        redirectTo: '/'
      });
  });
