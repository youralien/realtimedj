'use strict';

/* Directives */

angular.module('myApp.directives', ['nav-directives']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
