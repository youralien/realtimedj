'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('myApp', ['myApp.filters', 'myApp.directives', 'myApp.controllers']);

app.config(['$locationProvider', function($locationProvider) {
  //so weird hashes aren't in the urls
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
}]); 