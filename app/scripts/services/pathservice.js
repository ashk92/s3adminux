'use strict';

/**
 * @ngdoc service
 * @name s3adminApp.pathservice
 * @description
 * # pathservice
 * Service in the s3adminApp.
 */
angular.module('s3adminApp')
  .service('pathservice', function () {
    
    var baseUrlDetails = {baseUrl:'https://s3admin-qa.mulesoft.com/api'};

    
    this.getBaseUrl = function(){
    	return baseUrlDetails.baseUrl;
    };

    this.getLoginApiUrl = function(){
    	return baseUrlDetails.baseUrl + '/login';
    };

    this.getLogoutApiUrl = function(){
    	return baseUrlDetails.baseUrl + '/logout';
    };
    
    this.getBucketsApiUrl = function(){
    	return baseUrlDetails.baseUrl + '/buckets';
    };

    this.getDownloadFileApiUrl = function(bucketName, currentPath, selectedObject){
    	return baseUrlDetails.baseUrl + '/buckets/' + bucketName + '/files?prefix=' + currentPath + selectedObject;
    };

    this.getDeleteFileApiUrl = function(bucketName,currentPath,selectedObject){
    	return baseUrlDetails.baseUrl + '/buckets/' + bucketName + '/files?prefix=' + currentPath + selectedObject;
    };

    this.getDeleteFolderApiUrl = function(bucketName,currentPath,selectedObject){
    	return baseUrlDetails.baseUrl + '/buckets/' + bucketName + '/folders?prefix=' + currentPath + selectedObject;
    };

    this.getRenameFileApiUrl = function(bucketName,currentPath,selectedObject){
    	return baseUrlDetails.baseUrl + '/buckets/' + bucketName + '/files?prefix=' + currentPath + selectedObject;
    };

    this.getCreateFolderApiUrl = function(bucketName,currentPath,newFolderName){
    	return baseUrlDetails.baseUrl + '/buckets/' + bucketName + '/folders?prefix=' + currentPath + newFolderName;
    };

    this.getUploadFileApiUrl = function(bucketName,currentPath){
    	return baseUrlDetails.baseUrl + '/buckets/' + bucketName + '/files?prefix='+ currentPath;
    };

    this.getCurrentPathObjectsApiUrl = function(bucketName,currentPath){
    	return baseUrlDetails.baseUrl + '/buckets/' + bucketName + '?prefix=' + currentPath;
    };

    this.getSelectedObjectPropertiesApiUrl = function(bucketName,currentPath,selectedObject){
        return baseUrlDetails.baseUrl + '/buckets/' + bucketName + '/files/fileproperties?prefix=' + currentPath + selectedObject;
    }

    //Functions that provide API Urls for Admin Service
    this.getAdminBucketsApiUrl = function(){
    	return baseUrlDetails.baseUrl + '/s3admin/buckets';
    };

    this.getAdminUsersApiUrl = function(){
    	return baseUrlDetails.baseUrl + '/s3admin/users';
    };

    this.getUserBucketsApiUrl = function(userId){
    	return baseUrlDetails.baseUrl + '/s3admin/users/userBuckets?userId=' + userId;
    };

    this.getBucketUsersApiUrl = function(bucketName){
    	return baseUrlDetails.baseUrl + '/s3admin/buckets/' + bucketName;
    };

    this.getChangeUserBucketsApiUrl = function(userId){
    	return baseUrlDetails.baseUrl + '/s3admin/users/userBuckets?userId=' + userId;
    };

    this.getChangeBucketUsersPermissionsApiUrl = function(bucketName){
    	return baseUrlDetails.baseUrl + '/s3admin/buckets/' + bucketName;
    };

    this.getDeleteUserApiUrl = function(userId){
  		return baseUrlDetails.baseUrl + '/s3admin/users?userId=' + userId;
    };

    this.getRemoveBucketPermissionApiUrl = function(bucketName){
    	return baseUrlDetails.baseUrl + '/s3admin/buckets/' + bucketName;
    };

    this.getCreateUserApiUrl = function(){
    	return baseUrlDetails.baseUrl + '/s3admin/users';
    };

    this.getGrantPermissionForBucketApiUrl = function(bucketName){
		return baseUrlDetails.baseUrl + '/s3admin/buckets/' + bucketName;
    };

    this.getProfileApiUrl = function(){
        return baseUrlDetails.baseUrl + '/profile';
    }
  });
