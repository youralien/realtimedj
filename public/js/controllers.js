'use strict';

/* Controllers */

function AppCtrl($scope, socket) {

  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push(data.name);
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
    }
  });

  socket.on('dj:play', function (data) {
    $scope.playMe();
  });

  socket.on('dj:stop', function (data) {
    $scope.stopMe();
  })
  // Private helpers
  // ===============

  var changeName = function (oldName, newName) {
    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i] === oldName) {
        $scope.users[i] = newName;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

  // Methods published to the scope
  // ==============================

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        
        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  $scope.messages = [];

  $scope.sendMessage = function () {
    socket.emit('send:message', {
      message: $scope.message
    });

    // add the message to our model locally
    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });

    // clear message box
    $scope.message = '';
  };

  $scope.play = function () {
    player.play(0, remixed);
    socket.emit('dj:play', {
      user: $scope.name
    });
  };

  $scope.stop = function () {
    player.stop();
    socket.emit('dj:stop', {
      user: $scope.name
    })
  };

  $scope.playMe = function () {
    player.play(0, remixed);
  };


  $scope.stopMe = function () {
    player.stop();
  };

  $scope.faster = function () {
    var factor = player.getSpeedFactor() - .05;
    
    // We can't have the speed factor below zero. No backwards playing
    if (factor < 0) {
        factor = 0;
    }
    setSpeedFactor(factor)
    player.stop()
    player.play(player.curTime(), remixed)
  };

  $scope.slower = function () {
    var factor = player.getSpeedFactor() + .05;
    setSpeedFactor(factor)
    player.stop()
    player.play(player.curTime(), remixed);
  };

}
