'use strict';

var app = angular.module('s3adminApp');

app.controller('BucketUsersCtrl', function ($scope, $http, $window, $routeParams, $cookies, pathservice){
	
	$scope.accessToken = $cookies.get('accessToken');
	$scope.currentBucket = $routeParams.bucketName;
	$scope.bucketUsersList = [];
	$scope.allSelected = false;
	$scope.newUserEmail = '';
	$scope.selectedPermission = '';
	$scope.noneSelected = true;
	$scope.permissionsMessage = '';

  	var ALERT_INFO = 'alert alert-info';
  	var ALERT_SUCCESS = 'alert alert-success';
  	var ALERT_ERROR = 'alert alert-danger';

  	$scope.goBack = function(){
  		$window.location.href = '#/buckets';
  	};

  	$scope.showAlert = function(alertType, message){
		$scope.enableAlert = true;
		$scope.alertType = alertType;
		$scope.alertMessage = message;
	};

	$scope.closeAlert = function(){
		$scope.enableAlert = false;
		$scope.alertMessage = '';
	};

	$scope.reset = function(){
		$scope.closeAlert();
		$scope.newUserEmail = '';
		$scope.selectedPermission = '';
	};

	$scope.viewAllBuckets = function(){
		$window.location.href = '#/admin/buckets';
	};

	$scope.viewAllUsers = function(){
		$window.location.href = '#/admin/users';	
	};

	$scope.selectAll = function(){
		$scope.closeAlert();

		var i = 0;
		if($scope.allSelected === true){
			for(i=0; i< $scope.bucketUsersList.length; i++){
				$scope.bucketUsersList[i].isSelected = true;
			}
		}
		else{
			for(i=0; i< $scope.bucketUsersList.length; i++){
				if($scope.bucketUsersList[i].isSelected === false){
					return;
				}
			}
			for(i=0; i< $scope.bucketUsersList.length; i++){
				$scope.bucketUsersList[i].isSelected = false;
			}
		}
	};

	$scope.addUser = function(){
		$scope.closeAlert();

		if($scope.newUserEmail.length === 0){
			$scope.showAlert(ALERT_ERROR,'No email address specified');
			return;
		}
		else if($scope.newUserEmail.indexOf('@') !== -1){
			$scope.showAlert(ALERT_ERROR,'Error. @mulesoft.com will be automatically appended');
			return;
		}
		else if($scope.selectedPermission === ''){
			$scope.showAlert(ALERT_ERROR,'Please select a permission type');
			return;
		}
		else{}

		var userPermission = {userEmail:'', permissionType:''};

		userPermission.userEmail = $scope.newUserEmail + '@mulesoft.com';
		userPermission.permissionType = $scope.selectedPermission;
		
		$http.post(
			pathservice.getGrantPermissionForBucketApiUrl($scope.currentBucket), 
			JSON.stringify(userPermission),
			{headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + $scope.accessToken}}
        ).success(function(response,status){
			$scope.showAlert(ALERT_SUCCESS,'Successfully granted permission to user');
			$scope.getBucketUsersList();
		}).error(function(data, status){
			if(status === 401){
				$scope.logout();
			}
			else if(status === 400){
				$scope.showAlert(ALERT_ERROR,'Unable to add user. Please ensure that the user has been created.');
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Unable to add user.');	
			}
		});
	};

	$scope.removeSelectedUsers = function(){
		$scope.closeAlert();

		//If nothing selected show alert
		var i=0;
		var noneSelected = true;

		for(i=0; i<$scope.bucketUsersList.length; i++){
			if($scope.bucketUsersList[i].isSelected){
				noneSelected = false;
			}
		}

  		if(noneSelected){
  			$scope.showAlert(ALERT_INFO, 'No users selected');
  		}
  		else{
  			if($window.confirm('Are you sure you want to REMOVE the selected users') === false){
  				return;
  			}

			//Form the object
			var bucketPermissions =  [];

			for(i=0; i<$scope.bucketUsersList.length; i++){

				if($scope.bucketUsersList[i].isSelected){
					var userPermission = {userId:'',permissionType:''};
					userPermission.userId = $scope.bucketUsersList[i].userId;
					userPermission.permissionType = 'NONE';
					bucketPermissions.push(userPermission);
				}
			}

			$http.put(
				pathservice.getRemoveBucketPermissionApiUrl($scope.currentBucket), 
				JSON.stringify(bucketPermissions),
				{headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + $scope.accessToken}}
			)
			.success(function(response,status){
				$scope.showAlert(ALERT_SUCCESS,'Successfully removed the users');
				$scope.getBucketUsersList();
			})
			.error(function(data, status){
				if(status === 401){
					$scope.logout();
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Error. Unable to remove users');
				}
			});	
		}
	};

	$scope.formPermissionsMessage = function(){
		$scope.reset();

		var i = 0;
		$scope.noneSelected = true;

		for(i=0;i<$scope.bucketUsersList.length;i++){
			if($scope.bucketUsersList[i].isSelected){
				$scope.noneSelected = false;
				break;
			}
		}

		if($scope.noneSelected){
			$scope.permissionsMessage = 'Please select at least one user to change permission';
		}
		else{
			$scope.permissionsMessage = 'Change the permission for users of bucket:   ' + $scope.currentBucket;
		}
	};

	$scope.changePermission = function(){
		if($scope.noneSelected){
			$scope.showAlert(ALERT_ERROR,'No selections were made');
			return;
		}
		else if($scope.selectedPermission === ''){
			$scope.showAlert(ALERT_ERROR,'No permission was selected');
			return;
		}
		else{}

		//Form the object
		var bucketPermissions = [];
		var i = 0;

		for(i=0; i<$scope.bucketUsersList.length; i++){

			if($scope.bucketUsersList[i].isSelected){
				var userPermission = {userId:'',permissionType:''};
				userPermission.userId = $scope.bucketUsersList[i].userId;
				userPermission.permissionType = $scope.selectedPermission;
				bucketPermissions.push(userPermission);
			}
		}

		$http.put(
			pathservice.getChangeBucketUsersPermissionsApiUrl($scope.currentBucket), 
			JSON.stringify(bucketPermissions),
			{headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function(response,status){	
			$scope.showAlert(ALERT_SUCCESS,'Successfully modified the permissions');
			$scope.getBucketUsersList();
		})
		.error(function(data, status){
			if(status === 401){
				$scope.logout();
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Error. Unable to modify permissions');
			}
		});
	};

	$scope.getBucketUsersList = function(){

		$http.get(
			pathservice.getBucketUsersApiUrl($scope.currentBucket),
			{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function (response, status) {
			
			$scope.bucketUsersList = response.permits;

			for(var i=0; i<$scope.bucketUsersList.length; i++){
				$scope.bucketUsersList[i].isSelected = false;
			}
		}).error(function(response,status){
			if(status === 401){
				$scope.logout();
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Unable to list users having permission to bucket: '+$scope.currentBucket);
			}
		});

		$scope.allSelected = false;
	};

	$scope.logout = function(){
    
        $cookies.put('logout','true');
        $window.location.href = '#/';
    };

	var init = function () {
		$scope.getBucketUsersList();
	};

	init();
});