'use strict';

describe('Directive: mainnav', function () {

  // load the directive's module
  beforeEach(module('s3adminApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mainnav></mainnav>');
    element = $compile(element)(scope);
  }));
  
});
