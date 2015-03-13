'use strict';

/* Controllers */

function AppCtrl($scope, socket) {

  // Socket listeners
  // ================
  var acts = {
    'ready': 'is ready to real-time DJ.',
    'play': 'started the music.',
    'stop': 'stopped the music.',
    'faster': 'turned up the beat!',
    'slower': 'turned down for what!'
  }

  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
    $scope.speedFactor = 100;
    $scope.dj = {
      name: data.name,
      action: acts.ready
    };
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
    updateDjAction(data.name, 'play')
  });

  socket.on('dj:stop', function (data) {
    $scope.stopMe();
    setSpeedFactor(1);
    updateDjAction(data.name, 'stop')
  });

  socket.on('dj:faster', function (data) {
    $scope.fasterMe(data.factor, data.time);
    updateDjAction(data.name, 'faster')
  });

  socket.on('dj:slower', function (data) {
    $scope.slowerMe(data.factor, data.time);
    updateDjAction(data.name, 'slower')
  });

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

  var updateDjAction = function (name, action) {
    $scope.dj.name = name;
    $scope.dj.action = acts[action];
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
      name: $scope.name
    });
    updateDjAction($scope.name, 'play')
  };

  $scope.stop = function () {
    player.stop();
    $scope.speedFactor = 100;
    setSpeedFactor(1);
    socket.emit('dj:stop', {
      name: $scope.name
    });
    updateDjAction($scope.name, 'stop')

  };

  $scope.playMe = function () {
    player.play(0, remixed);
  };


  $scope.stopMe = function () {
    player.stop();
    $scope.speedFactor = 100;
  };

  $scope.faster = function () {
    var factor = player.getSpeedFactor() - .05;
    
    // We can't have the speed factor below zero. No backwards playing
    if (factor < 0) {
        factor = 0;
    }
    $scope.speedFactor = factor * 100;
    $scope.fasterMe(factor, player.curTime());
    socket.emit('dj:faster', {
      name: $scope.name,
      factor: factor,
      time: player.curTime()
    });
    updateDjAction($scope.name, 'faster')
  };

  $scope.slower = function () {
    var factor = player.getSpeedFactor() + .05;
    $scope.speedFactor = factor * 100;
    $scope.slowerMe(factor, player.curTime());
    socket.emit('dj:slower', {
      name: $scope.name,
      factor: factor,
      time: player.curTime()
    });
    updateDjAction($scope.name, 'slower')
  };

  $scope.fasterMe = function (factor, time) {
    $scope.speedFactor = factor * 100;
    setSpeedFactor(factor)
    player.stop()
    player.play(time, remixed);
  };

  $scope.slowerMe = function (factor, time) {
    $scope.speedFactor = factor * 100;
    setSpeedFactor(factor)
    player.stop()
    player.play(time, remixed);
  };

}
