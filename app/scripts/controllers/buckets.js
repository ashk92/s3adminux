'use strict';

var app = angular.module('s3adminApp');

app.controller('BucketsCtrl',function ($scope, $http, $window, $cookies, pathservice) {

	$scope.bucketList = [];
	$scope.accessToken = $cookies.get('accessToken');
	
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
			if(status !== 200){
				$scope.showAlert(ALERT_ERROR,'Unable to list folders');
			}
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
				$window.location.href = '#/admin';
			}
			else{
				$scope.showAlert(ALERT_ERROR,'You are not an admin user');
        	}
		}).error( function(data,status){
			if(status === 401){
				$scope.logout();
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Unable to get user permission. Cannot navigate to admin page.');
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