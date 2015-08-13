'use strict';

var app = angular.module('s3adminApp');

app.controller('ExplorerCtrl',function ($scope, $http, $window, $timeout, $routeParams, $cookies, pathservice, Upload) {

  	$scope.bucketName = $routeParams.bucketName;
  	$scope.currentPath = '';

    // Object to point to selection
  	$scope.selectedObject = null;

    // Inputs for file properties
  	$scope.newFileName = '';
    $scope.newContentType = '';
    $scope.selectedPermission = '';

    // Alerts variable
  	$scope.enableAlert = false;
    $scope.alertType = 'none';
    $scope.alertMessage = 'none';

    // Variables for create folder option
  	$scope.createFolderOptionVisible = false;
    $scope.newFolderName = 'newFolder';

    // File upload variables
  	$scope.fileUploadProgressBarVisible = false;
    $scope.fileProgressPercentage = 0;
  	
  	var ALERT_INFO = 'alert alert-info';
  	var ALERT_SUCCESS = 'alert alert-success';
  	var ALERT_ERROR = 'alert alert-danger';

    $scope.accessToken = $cookies.get('accessToken');

  	$scope.downloadObject = function(){
  		
  		if($scope.selectedObject === null){
  			$scope.showAlert(ALERT_INFO,'Please select a file to download');
  		}
  		else if($scope.selectedObject.type === 'FOLDER'){
  			$scope.showAlert(ALERT_ERROR,'Cannot download a folder');
  		}
  		else{

        $http.get(
          pathservice.getDownloadFileApiUrl($scope.bucketName,$scope.currentPath,$scope.selectedObject.name),
          {headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
        ).success(function (data) {
          $window.open(data, '_blank');
        }).error(function(data,status){
          if(status === 401){
            $scope.logout();
          }
          else{
            $scope.showAlert(ALERT_ERROR,'Unable to download.');
          }
        });
  		}
  	};

  	$scope.deleteObject = function(){

  		if($scope.selectedObject === null){
  			$scope.showAlert(ALERT_INFO,'Please select a file or folder to delete');
  		}

  		else if($scope.selectedObject.type === 'FOLDER'){

  			if($window.confirm('Are you sure you want to delete the entire FOLDER?') === false){
  				return;
  			}

  			$http.delete(pathservice.getDeleteFolderApiUrl($scope.bucketName,$scope.currentPath,$scope.selectedObject.name),{headers: {'Authorization': 'Bearer ' + $scope.accessToken}}).success(function (response, status) {

		    	if(status === 200){
		    		$scope.showAlert(ALERT_SUCCESS,'Folder successfully deleted');
		    		$scope.navigate(null);
            $scope.deselect();
		    	}
		  	}).error(function(data,status){
          if(status === 401){
            $scope.logout();
          }
          else{
            $scope.showAlert(ALERT_ERROR,'Unable to delete folder');
          }
		  	});
  		}

  		else{

  			if($window.confirm('Are you sure you want to delete the FILE?') === false){
  				return;
  			}
        
  			$http.delete(
          pathservice.getDeleteFileApiUrl($scope.bucketName,$scope.currentPath,$scope.selectedObject.name),
          {headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
        ).success(function (response, status) {
		    	if(status === 200){
		    		$scope.showAlert(ALERT_SUCCESS,'File successfully deleted');
		    		$scope.navigate(null);
            $scope.deselect();
		    	}
		  	}).error(function(data,status){
          if(status === 401){
           $scope.logout();
          }
          else{
            $scope.showAlert(ALERT_ERROR,'Unable to delete file');
          }
		  	});
  		}
  	};

  	$scope.modifyFile = function(){

  		if($scope.selectedObject === null){
  			$scope.showAlert(ALERT_INFO,'Please select a file to modify properties');
  		}
  		else{

        if($scope.newFileName === '' && $scope.selectedPermission === '' && $scope.newContentType === ''){
          $scope.showAlert(ALERT_ERROR,'No changes to make in file properties');
          return;
        }

        var fileProperties = {newFileName:'',permissionType:'',contentType:''};

        fileProperties.newFileName = $scope.newFileName;
        fileProperties.permissionType = $scope.selectedPermission;
        fileProperties.contentType = $scope.newContentType;

        $http.put(
            pathservice.getRenameFileApiUrl($scope.bucketName,$scope.currentPath,$scope.selectedObject.name),
            JSON.stringify(fileProperties),
            {headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + $scope.accessToken
            }})
        .success(function(response,status){
          	if(status === 200){
          		$scope.showAlert(ALERT_SUCCESS,'File properties successfully modified');
          		$scope.navigate(null);
          	}
          	else{
          		$scope.showAlert(ALERT_ERROR,'Unable to change all the properties');
          	}
          })
        .error(function(data,status){
          if(status === 401){
            $scope.logout();
          }
          else{
            $scope.showAlert(ALERT_ERROR,'Unable to modify file properties. '+data);
          }
        });
    	}
      $scope.resetInputs();
      $scope.deselect();
  	};

  	$scope.createNewFolder = function(){

      var fd = new FormData();
      
      $http.post(pathservice.getCreateFolderApiUrl($scope.bucketName,$scope.currentPath,$scope.newFolderName), fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined, 'Authorization': 'Bearer ' + $scope.accessToken}
      })
      .success(function(response,status){
      	if(status === 200){
      		$scope.showAlert(ALERT_SUCCESS,'Folder successfully created');
      		$scope.navigate(null);
      	}
      	else{
      		$scope.showAlert(ALERT_ERROR,'Unable to create new folder');
      	}
      })
      .error(function(data,status){
        if(status === 401){
          $scope.logout();
        }
        else{
          $scope.showAlert(ALERT_ERROR,'Unable to create new folder. '+data);
        }
      });

      $scope.resetInputsAndAlerts();
  	};

  	$scope.showCreateFolderOption = function(){
  		
  		$scope.selectedObject = null;
  		$scope.createFolderOptionVisible = true;

  		var t = angular.element('#newFolderName');
  		$timeout(function () {
  			t.focus();
  		}, 100);
  	};

  	$scope.goBack = function(){
  		if($scope.currentPath === ''){
  			$window.location.href = '#/buckets/';
  		}
  		else{
  			var lastIndex = $scope.currentPath.lastIndexOf('/');
  			var firstIndex = $scope.currentPath.indexOf('/');

  			if(lastIndex === firstIndex){
  				$scope.currentPath = '';
  			}
  			else{
  				lastIndex = $scope.currentPath.substring(0,lastIndex).lastIndexOf('/');
  				$scope.currentPath = $scope.currentPath.substring(0,lastIndex+1);
  			}
  			 			
  			$scope.navigate();
  		}

      $scope.resetInputsAndAlerts();
      $scope.deselect();
  	};

  	$scope.$watch('files', function () {
        $scope.removeDisplays();
        $scope.upload($scope.files);
    });

    $scope.upload = function (files) {

        if (files != null) {
            
            $scope.fileUploadProgressBarVisible = true;

            var file = files[0];
            Upload.upload({
                url: pathservice.getUploadFileApiUrl($scope.bucketName, $scope.currentPath),
                headers: {'Authorization': 'Bearer ' + $scope.accessToken},
                fields: {'fileSize': files[0].size,'fileType': files[0].type},
                file: file
            }).progress(function (evt) {
                $scope.fileProgressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function () {
            	  $scope.resetFileUploadStat();
                $scope.showAlert(ALERT_SUCCESS,'File uploaded successfully ');
                $scope.navigate(null);
                $scope.deselect();
            }).error(function () {
                $scope.showAlert(ALERT_ERROR,'Unable to upload file');
                $scope.resetFileUploadStat();
            });
        }
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
    };

    $scope.getRefactoredSize = function(size){
      if(size < 1024){
        return size + ' B';
      }
      else if(size < 1024*1024){
        return (size/1024.0).toFixed(2) + ' KB';
      }
      else if(size < 1024*1024*1024){
        return (size/(1024*1024.0)).toFixed(2) + ' MB';
      }
      else if(size < 1024*1024*1024*1024){
        return (size/(1024*1024*1024.0)).toFixed(2) + ' GB';
      }
      else{
        return '>= 1 TB';
      }
    };

    $scope.showAlert = function(alertType, message){
      $scope.enableAlert = true;
      $scope.alertType = alertType;
      $scope.alertMessage = message;
    };

    $scope.resetFileUploadStat = function(){
    	$scope.fileUploadProgressBarVisible = false;
    	$scope.fileProgressPercentage = 0;
    };

    $scope.hideCreateFolderOption = function(){
      $scope.createFolderOptionVisible = false;
    };

  	$scope.resetInputsAndAlerts = function(){
      // Close any alert
  		$scope.closeAlert();

      // Remove create folder Option
  		$scope.hideCreateFolderOption();

      // Reset variables associated with file modification
      $scope.selectedPermission = '';
      $scope.newFileName = '';
      $scope.newContentType = '';
  	};

    $scope.removeDisplays = function(){
      // Close any alert and create folder option
      $scope.closeAlert();
      $scope.hideCreateFolderOption();
    };

    $scope.resetInputs = function(){
      // Reset variables associated with file modification
      $scope.selectedPermission = '';
      $scope.newFileName = '';
      $scope.newContentType = '';
    };

  	$scope.deselect = function(){
  		$scope.selectedObject = null;
  	};

    $scope.closeAlert = function(){
      $scope.enableAlert = false;
    };

  	$scope.navigate = function(objectName){

  		// Append to the current path if the the object selected is a folder
  		if( objectName != null && objectName.charAt(objectName.length-1) === '/'){
  			$scope.currentPath += objectName;
  			$scope.requesturl += objectName;
  		}

  		// Navigate only if folder is selected or during initialization
  		if(objectName == null || objectName.charAt(objectName.length-1) === '/'){
	  		$http.get(
          pathservice.getCurrentPathObjectsApiUrl($scope.bucketName, $scope.currentPath),
          {headers: {'Authorization': 'Bearer ' + $scope.accessToken}}
        ).success(function (response, status) {
		    	$scope.objectList = response.objectList;
		    	if(status !== 200){
		    		$scope.showAlert(ALERT_ERROR,'Unable to list folders');
		    	}
		  	}).error( function(data,status){
          if(status === 401){
            $scope.logout();
          }
          else{
            $scope.showAlert(ALERT_ERROR,'Unable to list folders. '+data);
          }
        });
  		}

  		//Reset only if we change the path
  		if(objectName !== null){
  			$scope.resetInputsAndAlerts();
  			$scope.deselect();
  		}
  	};

    $scope.logout = function(){
    
        $cookies.put('logout','true');
        $window.location.href = '#/';
    };

  	var init = function () {
      $scope.currentPermission = $cookies.get('bucketPermission');
	    $scope.navigate();
	  };
	
	init();
  });
