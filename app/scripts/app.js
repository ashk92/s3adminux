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
      .when('/admin/buckets',{
        templateUrl: 'views/allbuckets.html',
        controller: 'AllBucketsCtrl',
      })
      .when('/admin/buckets/:bucketName',{
        templateUrl: 'views/bucketusers.html',
        controller: 'BucketUsersCtrl',
      })
      .when('/admin/users',{
        templateUrl: 'views/allusers.html',
        controller: 'AllUsersCtrl',
      })
      .when('/admin/users/:userId',{
        templateUrl: 'views/userbuckets.html',
        controller: 'UserBucketsCtrl',
      })
      .otherwise({
        redirectTo: '/'
      });
  });
