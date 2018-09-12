"use strict";

// Setup local development environment variables
if('production' !== process.env.NODE_ENV) {
    require('dotenv').config();
}

// Express.js Deps
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Routes and Middleware
const indexRouter = require('./routes/index');
const oauthRouter = require('./routes/oauth');
const usersRouter = require('./routes/users');
const zoomRouter = require('./routes/zoom');
const ZoomMiddleware = require('./middleware/zoom');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

/**
 * Set and create a new instance of ZoomMiddleware.
 * The `client_id` and `secret_key` can be set either here
 * or in your environment variables (e.g. for Heroku)
 *
 * NOTE: If you have ZOOM_CLIENT_ID and ZOOM_SECRET_KEY
 * set in your environment, you can create the new ZoomMiddleware
 * instance with `const zMiddleware = new ZoomMiddleware()`
 *
 * @type {ZoomMiddleware|exports|module.exports}
 */
const zMiddleware = new ZoomMiddleware({
    'client_id': process.env.ZOOM_CLIENT_ID,
    'secret_key': process.env.ZOOM_CLIENT_SECRET
});

app.use('/oauth', zMiddleware, oauthRouter);
app.use('/users', zMiddleware, usersRouter);
app.use('/zoom', zMiddleware, zoomRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
