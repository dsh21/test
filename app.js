var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

//
var nodemailer = require('nodemailer');
//
var session = require('express-session');
var passport = require('passport');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
//
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('connect-flash');

var app = express();

app.use(function(req,res,next){
    // req.db = db;
    // req.mysql_conn = mysql_conn;
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var upload = multer({ dest: './uploads' });
app.use(upload);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handler express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// router js
var routes = require('./routes/index');
var artist = require('./routes/artist');

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;
        
        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
          param: formParam,
          msg: msg,
          value: value  
        };
    }
}));

// flash
app.use(flash());
app.use(function(req, res, next) {
   res.locals.messages = require('express-messages')(req, res);
   next(); 
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/artist', artist);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;