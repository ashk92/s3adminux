'use strict';

var app = angular.module('s3adminApp');

app.controller('BucketsCtrl',function ($scope, $http, $window, $cookies, pathservice) {

	$scope.bucketList = [];
	$scope.accessToken = $cookies.get('accessToken');

	$scope.enableAlert = false;
	$scope.alertMessage = '';
	
  	var ALERT_ERROR = 'alert alert-danger';

	$scope.openBucket = function(bucketName,permissionType){
		//Navigate to explorer page
		$cookies.put('bucketPermission',permissionType);
		$window.location.href = '#/buckets/'+bucketName;
	};

	$scope.showAlert = function(alertType, message){
  		$scope.enableAlert = true;
  		$scope.alertType = alertType;
		$scope.alertMessage = message;
  	};

  	$scope.closeAlert = function(){
  		$scope.enableAlert = false;
  	}

	$scope.getBucketList = function(){

		if($scope.accessToken === null){
			$window.location.href='#/';
			return;
		}
		$http.get(
			pathservice.getBucketsApiUrl(),
			{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function (data, status) {
			$scope.bucketList = data;
		}).error( function(data,status){
			if(status === 401){
				$scope.logout();
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Unable to get the buckets List');
			}
		});
	};

	$scope.gotoAdminPage = function(){

		$http.get(
			pathservice.getProfileApiUrl(),
			{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function (data, status) {
			if(data.userType === 'ADMIN'){
				$window.location.href = '#/admin/buckets';
			}
			else{
				$scope.showAlert(ALERT_ERROR,'You are not an admin user');
        	}
		}).error( function(data,status){
			if(status === 401){
				$scope.logout();
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Unable to verify permission. Cannot navigate to admin page.');
			}
		});
	}

	$scope.logout = function(){
		
        $cookies.put('logout','true');
        $window.location.href = '#/';
	};

	var init = function () {
		$scope.getBucketList();
	};
	
	init();

});