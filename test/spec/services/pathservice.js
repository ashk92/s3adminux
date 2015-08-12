'use strict';

describe('Service: pathservice', function () {

  // load the service's module
  beforeEach(module('s3adminApp'));

  // instantiate service
  var pathservice;
  beforeEach(inject(function (_pathservice_) {
    pathservice = _pathservice_;
  }));

  it('should do something', function () {
    expect(!!pathservice).toBe(true);
  });

});
