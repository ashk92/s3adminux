'use strict';

var app = angular.module('s3adminApp');

app.controller('AllBucketsCtrl', function ($scope, $http, $window, $cookies, pathservice){
	
	$scope.accessToken = $cookies.get('accessToken');
	$scope.allBucketList = [];

  	var ALERT_ERROR = 'alert alert-danger';

  	$scope.goBack = function(){
  		$window.location.href = '#/buckets';
  	};

  	$scope.showAlert = function(alertType, message){
		$scope.enableAlert = true;
		$scope.alertType = alertType;
		$scope.alertMessage = message;
	};

	$scope.viewBucketUsersTable = function(bucketName){
		$window.location.href = "#/admin/buckets/" + bucketName;
	};

	$scope.closeAlert = function(){
		$scope.enableAlert = false;
		$scope.alertMessage = '';
	};

	$scope.viewAllBuckets = function(){
		$scope.getAllBucketList();		
	};

	$scope.viewAllUsers = function(){
		$window.location.href = '#/admin/users';	
	};

	$scope.getAllBucketList = function(){

		$http.get(
			pathservice.getAdminBucketsApiUrl(),
			{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function (data, status) {
			$scope.allBucketList = data;
			for(var i=0; i<$scope.allBucketList.length; i++){
				$scope.allBucketList[i].isSelected = false;
			}
		}).error(function(data,status){
			if(status === 401){
				$scope.logout();
			}
			else if(status === 400){
				$scope.showAlert(ALERT_ERROR,'Unable to list buckets. '+data);	
			}
		});

	};

	$scope.logout = function(){
    
        $cookies.put('logout','true');
        $window.location.href = '#/';
    };

	var init = function () {
		$scope.getAllBucketList();
	};

	init();
});