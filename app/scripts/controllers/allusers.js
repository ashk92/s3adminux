'use strict';

var app = angular.module('s3adminApp');

app.controller('AllUsersCtrl', function ($scope, $http, $window, $cookies, pathservice){
	
	$scope.allUsersList = [];
	$scope.accessToken = $cookies.get('accessToken');
	$scope.selectedUserType = '';
	$scope.newUserEmail = '';
	$scope.allSelected = false;

	var ALERT_INFO = 'alert alert-info';
  	var ALERT_SUCCESS = 'alert alert-success';
  	var ALERT_ERROR = 'alert alert-danger';

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
		$scope.selectedUserType = '';
	};

	$scope.goBack = function(){
  		$window.location.href = '#/buckets';
  	};

	$scope.viewAllBuckets = function(){
		$window.location.href = '#/admin/buckets';
	};

	$scope.viewAllUsers = function(){
		$scope.getAllUsersList();	
	};

	$scope.viewUserBucketsTable = function(userId, userEmail){
		$window.location.href = '#/admin/users/'+ userId + '?email=' + userEmail;
	};

	$scope.selectAll = function(){
		var i = 0;
		
  		if($scope.allSelected === true){
  			for(i=0; i < $scope.allUsersList.length; i++){
  				$scope.allUsersList[i].isSelected = true;
  			}
  		}
  		else{
  			for(i=0; i< $scope.allUsersList.length; i++){
  				if($scope.allUsersList[i].isSelected === false){
  					return;
  				}
  			}
  			for(i=0; i< $scope.allUsersList.length; i++){
  				$scope.allUsersList[i].isSelected = false;
  			}
  		}
	};

	$scope.addUser = function(){

		if($scope.newUserEmail.length === 0){
			$scope.showAlert(ALERT_ERROR,'No email address specified');
			return;
		}
		else if($scope.newUserEmail.indexOf('@') !== -1){
			$scope.showAlert(ALERT_ERROR,'Error. @mulesoft.com will be automatically appended');
			return;
		}
		else if($scope.selectedUserType === ''){
			$scope.showAlert(ALERT_ERROR,'Please select the type of user');
			return;
		}
		else {}

		var user = {email:'',userType:''};
		user.email = $scope.newUserEmail + '@mulesoft.com';
		user.userType = $scope.selectedUserType;

		$http.post(
			pathservice.getCreateUserApiUrl(),
			user,
			{headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + $scope.accessToken}}
        ).success(function(response,status){
			$scope.showAlert(ALERT_SUCCESS,'Successfully added the user');
			$scope.getAllUsersList();			
		})
		.error(function(data,status){
			if(status === 401){
				$scope.logout();
			}
			else{
				$scope.showAlert(ALERT_ERROR,'Error. Unable to add user.');
			}
		});

	};

	$scope.removeSelectedUsers = function(){
		//If nothing selected show alert
		var i=0;
		var noneSelected = true;

		for(i=0; i< $scope.allUsersList.length; i++){
			if($scope.allUsersList[i].isSelected){
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
			for(i=0; i<$scope.allUsersList.length; i++){
				if($scope.allUsersList[i].isSelected){
					$http.delete(
						pathservice.getDeleteUserApiUrl($scope.allUsersList[i].userId),
						{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
					)
					.success(function (response,status) {
						$scope.showAlert(ALERT_SUCCESS,'Successfull deleted user');
						$scope.getAllUsersList();
					})
					.error(function(data,status){
						if(status === 401){
							$scope.logout();
						}
						else{
							$scope.showAlert(ALERT_ERROR,'Error! Unable to delete user');
						}
					});	
				}
			}
		}
  	};

	$scope.getAllUsersList = function(){

		$http.get(
			pathservice.getAdminUsersApiUrl(),
			{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function (data, status) {
			
			$scope.allUsersList = data;

			for(var i=0; i<$scope.allUsersList.length; i++){
				$scope.allUsersList[i].isSelected = false;
			}	
			if(status !== 200){
				$scope.showAlert(ALERT_ERROR,'Unable to list users');
			}
		}).error(function(response,status){
			if(status === 401){
				$window.alert(data);
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
		$scope.getAllUsersList();
	};

	init();
});