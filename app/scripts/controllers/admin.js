'use strict';

var app = angular.module('s3adminApp');

app.controller('AdminCtrl', function ($scope, $http, $window, $cookies, pathservice){

	$scope.Tables = {BUCKETS_TABLE:1, USERS_TABLE:2, BUCKET_USERS_TABLE:3, USER_BUCKETS_TABLE:4};

	$scope.currentTable = $scope.Tables.BUCKETS_TABLE;
	
	$scope.selectedUser = '';
	$scope.selectedBucket = '';
	$scope.selectedUserType = '';
	$scope.selectedUserId = 0;
	$scope.alertMessage = '';
	$scope.newUserEmail = '';
	$scope.newBucketName = '';
	$scope.permissionsMessage = '';
	$scope.selectedPermission = '';
	$scope.accessToken = $cookies.get('accessToken');
	
	$scope.allUserList = [];
	$scope.allBucketList = [];
	$scope.bucketUsersList = [];
	$scope.userBucketsList = [];

	$scope.bucketSelected = false;
	$scope.userSelected = false;
	$scope.enableAlert = false;
	$scope.allSelected = false;
	$scope.noneSelected = true;

	var ALERT_INFO = 'alert alert-info';
  	var ALERT_SUCCESS = 'alert alert-success';
  	var ALERT_ERROR = 'alert alert-danger';

	$scope.setPermissionForSelected = function(permissionType){

		for(var i=0;i<$scope.allBucketList.length;i++){
			if($scope.allBucketList[i].isSelected){
				$scope.allBucketList[i].permissionType = permissionType;
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
		else{

			if($scope.currentTable === $scope.Tables.BUCKET_USERS_TABLE && $scope.selectedPermission === ''){
				$scope.showAlert(ALERT_ERROR,'Please select a permission type');
				return;
			}
			else if($scope.currentTable === $scope.Tables.USERS_TABLE && $scope.selectedUserType === ''){
				$scope.showAlert(ALERT_ERROR,'Please select the type of user');
				return;
			}
		}
		
		if($scope.currentTable === $scope.Tables.BUCKET_USERS_TABLE){

			var userPermission = {userEmail:'', permissionType:''};

			userPermission.userEmail = $scope.newUserEmail + '@mulesoft.com';
			userPermission.permissionType = $scope.selectedPermission;
			
			$http.post(
				pathservice.getGrantPermissionForBucketApiUrl($scope.selectedBucket), 
				JSON.stringify(userPermission),
				{headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $scope.accessToken}}
            ).success(function(response,status){
				if(status === 200){
					$scope.showAlert(ALERT_SUCCESS,'Successfully granted permission to user');
					$scope.getBucketUsersList($scope.selectedBucket);
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Error. Unable to grant permission');
				}
			}).error(function(data, status){
				if(status === 401){
					$scope.logout();
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Unable to modify permissions');
				}
			});

		}
		else if($scope.currentTable === $scope.Tables.USERS_TABLE){

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
				if(status === 200){
					$scope.showAlert(ALERT_SUCCESS,'Successfully added the user');
					$scope.getUserList();
				}
			})
			.error(function(data,status){
				if(status === 401){
					$scope.logout();
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Error. Unable to add user.');
				}
			});

		}

		$scope.resetSelections();
	};

	$scope.addBucket = function(){
		
		if($scope.newBucketName === '' || $scope.selectedPermission === ''){
			$scope.showAlert(ALERT_INFO,'Please enter the bucket name and select the permission');
		}

		else{

			var userPermission = {userEmail:'', permissionType:''};

			userPermission.userEmail = $scope.selectedUser;
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

		$scope.resetSelections();
	}

	$scope.removeSelectedUsers = function(){
		//If nothing selected show alert
		var i=0;
		var noneSelected = true;

		if($scope.currentTable === $scope.Tables.BUCKET_USERS_TABLE){
			for(i=0; i<$scope.bucketUsersList.length; i++){
				if($scope.bucketUsersList[i].isSelected){
					noneSelected = false;
				}
	  		}
  		}
  		else{
  			for(i=0; i< $scope.allUserList.length; i++){
				if($scope.allUserList[i].isSelected){
					noneSelected = false;
				}
	  		}
  		}

  		if(noneSelected){
  			$scope.showAlert(ALERT_INFO, 'No users selected');
  		}
  		else{
  			if($window.confirm('Are you sure you want to REMOVE the selected users') === false){
  				return;
  			}
  			
  			if($scope.currentTable === $scope.Tables.BUCKET_USERS_TABLE){
  				
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
					pathservice.getRemoveBucketPermissionApiUrl($scope.selectedBucket), 
					JSON.stringify(bucketPermissions),
					{headers: {
              			'Content-Type': 'application/json',
              			'Authorization': 'Bearer ' + $scope.accessToken}}
				).success(function(response,status){
					if(status === 200){
						$scope.showAlert(ALERT_SUCCESS,'Successfully removed the users');
						$scope.getBucketUsersList($scope.selectedBucket);
					}
					else{
						$scope.showAlert(ALERT_ERROR,'Error. Unable to remove users');
					}
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

  			else if($scope.currentTable === $scope.Tables.USERS_TABLE){

  				for(i=0; i<$scope.allUserList.length; i++){

  					if($scope.allUserList[i].isSelected){
  						
  						$http.delete(
  							pathservice.getDeleteUserApiUrl($scope.allUserList[i].userId),
  							{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
  						).success(function (response,status) {

							if(status === 200){
								$scope.showAlert(ALERT_SUCCESS,'Successfull deleted user');
								$scope.getUserList();
							}
							if(status !== 200){
								$scope.showAlert(ALERT_ERROR,'Unable to delete user');
							}
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
  		}
	};

  	$scope.goBack = function(){
  		$window.location.href = '#/buckets';
  	};

  	$scope.formPermissionsMessage = function(){

  		var i = 0;
  		$scope.noneSelected = true;

  		if($scope.currentTable === $scope.Tables.BUCKET_USERS_TABLE){

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
  				$scope.permissionsMessage = 'Change the permission for users of bucket:   ' + $scope.selectedBucket;
  			}
  		}
  		else{

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

  		var i = 0;
  		if($scope.currentTable === $scope.Tables.BUCKET_USERS_TABLE){

			//Form the object
			var bucketPermissions = [];

			for(i=0; i<$scope.bucketUsersList.length; i++){

				if($scope.bucketUsersList[i].isSelected){
					var userPermission = {userId:'',permissionType:''};
					userPermission.userId = $scope.bucketUsersList[i].userId;
					userPermission.permissionType = $scope.selectedPermission;
					bucketPermissions.push(userPermission);
				}
			}

			$http.put(
				pathservice.getChangeBucketUsersPermissionsApiUrl($scope.selectedBucket), 
				JSON.stringify(bucketPermissions),
				{headers: {
              		'Content-Type': 'application/json',
              		'Authorization': 'Bearer ' + $scope.accessToken}}
			).success(function(response,status){
				if(status === 200){
					$scope.showAlert(ALERT_SUCCESS,'Successfully modified the permissions');
					$scope.getBucketUsersList($scope.selectedBucket);
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Error. Unable to modify permissions');
				}
			})
			.error(function(data, status){
				if(status === 401){
					$scope.logout();
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Error. Unable to modify permissions');
				}
			});
  		}
  		else{
 
  			var buckets = [];

  			for(i=0; i<$scope.userBucketsList.length; i++){
  				if($scope.userBucketsList[i].isSelected){
  					buckets.push(angular.copy($scope.userBucketsList[i]));
  					delete buckets[buckets.length-1].isSelected;
  					buckets[buckets.length-1].permissionType = $scope.selectedPermission;
  				}
  			}

  			$http.put(
  				pathservice.getChangeUserBucketsApiUrl($scope.selectedUserId),
  				buckets,
  				{headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + $scope.accessToken}}
  			).success(function(response,status){
  				if(status === 200){
  					$scope.showAlert(ALERT_SUCCESS,'Successfully modified the permissions');
					$scope.getUserBucketsList($scope.selectedUserId);
  				}
  				else{
  					$scope.showAlert(ALERT_ERROR,'Error. Unable to modify permissions');
  				}
  			})	
  			.error(function(data,status){
  				if(status === 401){
					$scope.logout();
				}
				else{
					$scope.showAlert(ALERT_ERROR,'Error. Unable to modify permissions');
				}
  			});
  		}
  	};

  	$scope.selectAll = function(objectList){
  		var i = 0;
  		if($scope.allSelected === true){
  			for(i=0; i< objectList.length; i++){
  				objectList[i].isSelected = true;
  			}
  		}
  		else{
  			for(i=0; i< objectList.length; i++){
  				if(objectList[i].isSelected === false){
  					return;
  				}
  			}
  			for(i=0; i< objectList.length; i++){
  				objectList[i].isSelected = false;
  			}
  		}
  	};

  	$scope.showAlert = function(alertType, message){
		$scope.enableAlert = true;
		$scope.alertType = alertType;
		$scope.alertMessage = message;
	};

	$scope.viewBucketsTable = function(){
		$scope.reset();
		$scope.getAllBucketList(); 

		$scope.userSelected = false;
		$scope.bucketSelected = false;
		$scope.currentTable = $scope.Tables.BUCKETS_TABLE;
	};

	$scope.viewUsersTable = function(){
		$scope.reset();
		$scope.resetSelections();
		$scope.getUserList();

		$scope.bucketSelected = false;
		$scope.userSelected = false;
		$scope.currentTable = $scope.Tables.USERS_TABLE;
	};

	$scope.viewBucketUsersTable = function(bucketName){
		$scope.reset();
		$scope.getBucketUsersList(bucketName);
		
		$scope.userSelected = false;
		$scope.bucketSelected = true;
		$scope.selectedBucket = bucketName;
		$scope.currentTable = $scope.Tables.BUCKET_USERS_TABLE;
	};

	$scope.viewUserBucketsTable = function(userEmail,userId){
		$scope.reset();
		$scope.getUserBucketsList(userId);

		$scope.selectedUser = userEmail;
		$scope.selectedUserId = userId;
		$scope.userSelected = true;
		$scope.bucketSelected = false;
		$scope.currentTable = $scope.Tables.USER_BUCKETS_TABLE;
	};

	$scope.getBucketUsersList = function(bucketName){

		$http.get(
			pathservice.getBucketUsersApiUrl(bucketName),
			{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function (response, status) {
			
			$scope.bucketUsersList = response.permits;

			for(var i=0; i<$scope.bucketUsersList.length; i++){
				$scope.bucketUsersList[i].isSelected = false;
			}
			if(status !== 200){
				$scope.showAlert(ALERT_ERROR,'Unable to list users');
			}
		}).error(function(response,status){
			if(status === 401){
				$scope.logout();
			}
		});

		$scope.resetSelections();
	};

	$scope.getUserBucketsList = function(userId){

		$http.get(
			pathservice.getUserBucketsApiUrl(userId),
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

		$scope.resetSelections();
	};

  	$scope.getUserList = function(){

		$http.get(
			pathservice.getAdminUsersApiUrl(),
			{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
		).success(function (data, status) {
			
			$scope.allUserList = data;

			for(var i=0; i<$scope.allUserList.length; i++){
				$scope.allUserList[i].isSelected = false;
			}	
			if(status !== 200){
				$scope.showAlert(ALERT_ERROR,'Unable to list users');
			}
		}).error(function(response,status){
			if(status === 401){
				$scope.logout();
			}
		});
	};

	$scope.reset = function(){
		$scope.closeAlert();
	};

	$scope.resetSelections = function(){
		$scope.selectedPermission = '';
		$scope.allSelected = false;
		$scope.selectedUserType = '';
		$scope.newUserEmail = '';
	};

	$scope.closeAlert = function(){
		$scope.enableAlert = false;
		$scope.alertMessage = '';
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
			if(status !== 200){
				$scope.showAlert(ALERT_ERROR,'Unable to list buckets');
			}
		}).error(function(data,status){
			if(status === 401){
				$scope.logout();
			}
			else if(status === 400){
				$scope.showAlert(ALERT_ERROR,'Unable to list buckets. '+data);	
			}
		});

		$scope.resetSelections();
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