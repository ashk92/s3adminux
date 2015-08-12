'use strict';

/**
 * @ngdoc directive
 * @name s3adminApp.directive:mainnav
 * @description
 * # mainnav
 */
angular.module('s3adminApp')
  .directive('mainnav', function () {
    return {
      templateUrl: 'views/mainnavbar.html',
      restrict: 'C',
      
    };
  });
