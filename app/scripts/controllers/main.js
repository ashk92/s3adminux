'use strict';

angular.module('s3adminApp')
    .controller('MainCtrl', function ($scope, $http, $window, $cookies, pathservice) {

    $scope.nextPageUrl = '#/buckets';
    $scope.enableAlert = false;
    $scope.alertMessage = '';

    $scope.signIn = function(googleUser){

        //Check for logout
        if($cookies.get('logout') === 'true'){
            
            gapi.auth2.getAuthInstance().signOut();
            
            $http({
                method: 'POST',
                url: pathservice.getLogoutApiUrl(),
                headers: {'Authorization': 'Bearer ' + $cookies.get('accessToken')},
            })
            
            $scope.clearCookies();
            return;
        }

        // Check for cookies
        if($cookies.get('accessToken') != null){
            $window.location.href = $scope.nextPageUrl;
            return;
        }

    	$http({
            method: 'POST',
    		url: pathservice.getLoginApiUrl(),
    		headers: {'Content-Type': 'application/x-www-form-urlencoded'},

    		transformRequest: function(obj) {
    			var str = [];
    			for(var p in obj){
                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                }
    			return str.join('&');
    		},
    		data: {idToken: googleUser.getAuthResponse().id_token}

    	}).success(function(data,status){

            if(status === 200){
                $cookies.put('accessToken',data.accessToken);
                $window.location.href = $scope.nextPageUrl;
            }
            else{
                gapi.auth2.getAuthInstance().signOut();
                $scope.clearCookies();
            }

    	}).error(function(response,status){

    		if(status === 401){
    			$scope.showAlert('Please login with registered email. Email used: '+googleUser.getBasicProfile().getEmail());
            }
    		else{
    			$scope.showAlert('Login failed. Please try after some time');
    		}
            
            gapi.auth2.getAuthInstance().signOut();
            $scope.clearCookies();

    	});
    };

    $scope.clearCookies = function(){
        var cookies = $cookies.getAll();
        angular.forEach(cookies, function (v, k) {
            $cookies.remove(k);
        });
    };

    $scope.showAlert = function(errorMessage){
        $scope.alertMessage = errorMessage;
        $scope.enableAlert = true;
    };

    $scope.closeAlert = function(){
        $scope.enableAlert = false;
    };
  });