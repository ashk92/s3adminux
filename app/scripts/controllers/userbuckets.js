'use strict';

var app = angular.module('s3adminApp');

app.controller('UserBucketsCtrl', function ($scope, $http, $window, $routeParams, $cookies, pathservice){
	
	$scope.userBucketsList = [];
	$scope.accessToken = $cookies.get('accessToken');
	$scope.currentUserId = $routeParams.userId;
	$scope.newBucketName = '';
	$scope.selectedPermission = '';
	$scope.currentUserEmail = $routeParams.email;
	$scope.noneSelected = true;

	var ALERT_INFO = 'alert alert-info';
  	var ALERT_SUCCESS = 'alert alert-success';
  	var ALERT_ERROR = 'alert alert-danger';

	$scope.goBack = function(){
  		$window.location.href = '#/buckets';
  	};

	$scope.viewAllBuckets = function(){
		$window.location.href = '#/admin/buckets';
	};

	$scope.viewAllUsers = function(){
		$window.location.href = '#admin/users';
	};

	$scope.showAlert = function(alertType, message){
		$scope.enableAlert = true;
		$scope.alertType = alertType;
		$scope.alertMessage = message;
	};

	$scope.closeAlert = function(){
		$scope.enableAlert = false;
	};

	$scope.reset = function(){
		$scope.closeAlert();
		$scope.newBucketName = '';
		$scope.selectedPermission = '';
	};

	$scope.selectAll = function(){
		$scope.closeAlert();

		var i = 0;
		if($scope.allSelected === true){
			for(i=0; i< $scope.userBucketsList.length; i++){
				$scope.userBucketsList[i].isSelected = true;
			}
		}
		else{
			for(i=0; i< $scope.userBucketsList.length; i++){
				if($scope.userBucketsList[i].isSelected === false){
					return;
				}
			}
			for(i=0; i< $scope.userBucketsList.length; i++){
				$scope.userBucketsList[i].isSelected = false;
			}
		}
	};

	$scope.formPermissionsMessage = function(){
		var i = 0;
  		$scope.noneSelected = true;
  		$scope.reset();

  		for(i=0;i<$scope.userBucketsList.length;i++){
			if($scope.userBucketsList[i].isSelected){
				$scope.noneSelected = false;
				break;
			}
		}

		if($scope.noneSelected){
			$scope.permissionsMessage = 'Please select at least one bucket to change permission';
		}
		else{
			$scope.permissionsMessage = 'Change the permission of buckets for user: ' + $scope.selectedUser;
		}
	};

	$scope.changePermission = function(){
		if($scope.noneSelected){
  			$scope.showAlert(ALERT_INFO,'No selections were made');
  			return;
  		}
  		else if($scope.selectedPermission === ''){
  			$scope.showAlert(ALERT_ERROR,'No permission was selected');
  			return;
  		}
  		else{}

  		if($scope.selectedPermission === 'NONE'){
  			if($window.confirm('Are you sure you want to REMOVE the selected bucket permissions') === false){
  				return;
  			}
  		}

  		var buckets = [];
  		var i=0;

		for(i=0; i<$scope.userBucketsList.length; i++){
			if($scope.userBucketsList[i].isSelected){
				buckets.push(angular.copy($scope.userBucketsList[i]));
				delete buckets[buckets.length-1].isSelected;
				buckets[buckets.length-1].permissionType = $scope.selectedPermission;
			}
		}

		$http.put(
			pathservice.getChangeUserBucketsApiUrl($scope.currentUserId),
			buckets,
			{headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function(response,status){
			$scope.showAlert(ALERT_SUCCESS,'Successfully modified the permissions');
			$scope.getUserBucketsList();
		})	
		.error(function(data,status){
			if(status === 401){
				$scope.logout();
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Error. Unable to modify permissions');
			}
		});
  	};

  	$scope.removePermissions = function(){
  		$scope.selectedPermission = 'NONE';
  		$scope.changePermission();
  	};

	$scope.addBucket = function(){

		if($scope.newBucketName === '' || $scope.selectedPermission === ''){
			$scope.showAlert(ALERT_INFO,'Please enter the bucket name and select the permission');
		}

		else{

			var userPermission = {userEmail:'', permissionType:''};

			userPermission.userEmail = $scope.currentUserEmail;
			userPermission.permissionType = $scope.selectedPermission;

			$http.post(
				pathservice.getGrantPermissionForBucketApiUrl($scope.newBucketName), 
				JSON.stringify(userPermission),
				{headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $scope.accessToken}}
            ).success(function(response,status){
				if(status === 200){
					$scope.showAlert(ALERT_SUCCESS,'Successfully granted permission to user');
					$scope.getUserBucketsList($scope.selectedUserId);
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Error. Unable to grant permission');
				}
			}).error(function(data, status){
				if(status === 401){
					$scope.logout();
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Unable to grant permissions');
				}
			});
		}
	};

	$scope.getUserBucketsList = function(){

		$http.get(
			pathservice.getUserBucketsApiUrl($scope.currentUserId),
			{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function (response, status) {
			
			if(status === 200){
				$scope.userBucketsList = response.buckets;
				for(var i=0; i<$scope.userBucketsList.length; i++){
					$scope.userBucketsList[i].isSelected = false;
				}
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Unable to list buckets');
			}
		}).error(function(response,status){
			if(status === 401){
				$scope.logout();
			}
		});

		$scope.allSelected = false;
	};

	$scope.logout = function(){

		$cookies.put('logout','true');
		$window.location.href = '#/';
	};

	var init = function () {
		$scope.getUserBucketsList();
	};

	init();
});