routes = {};

routes.fbAuth = function(req, res) {};

routes.fbAuthCallback = function(req, res) {
  //callback for facebook passport
  console.log('FB returns ' + req.session.passport.user.displayName);
  var username = req.session.passport.user.displayName;
  // redirect to home page from fb
  res.redirect('/');
};

routes.getUsername = function(req, res){
  //find user from session
  if (emptyObjTest(req.session.passport) === true) {
    res.send('error');
  } else {
    var username = req.session.passport.user.displayName;
    var obj = { userName: username};
    if (!username){
      res.send('No User');
    } else {
      res.send(obj);
    }
  }
};

function emptyObjTest(obj) {
  // function to test if object is empty
  return Object.keys(obj).length === 0;
};

// Called by client when logging out to get rid of user credentials from session
routes.loggingOut = function(req, res) {
  req.session.passport = {};  
  // send something to client to change client
  res.send('logout');
};

module.exports = routes;
