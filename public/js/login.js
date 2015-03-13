  var app = angular.module('nav-directives', ['ngCookies']);

  app.directive('navBar', ['$cookieStore', '$http', '$location', function($cookieStore, $http, $location){
    return {
      restrict: 'E',
      templateUrl: '../templates/nav.html',
      controller: function(){
        var user = this;
        this.username = $cookieStore.get('username');

        $http.get('/username').success(function(data){
          //bake the cookie with username from server to control view.
          if (data !== 'error'){
            var username = data.userName;
            $cookieStore.put('username', username);
            user.username = username;
          }
        }).error(function(data){
          alert(data);  
        });

        this.eatCookie = function() {
          //eat the cookie!!(destroys it)
          var username = $cookieStore.get('username');
          $http.post('/logout').success(function(data, status, headers, config){
            console.log(username);
            $cookieStore.remove('username');
            user.username = '';
          }).error(function(data,status,headers,config){
            alert("There was an err loggin out")
          })
        };
      },
      controllerAs:'nav'
    };
  }]);