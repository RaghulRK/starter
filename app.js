const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./Utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes')
const viewRouter = require('./Routes/viewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');
const bookingController = require('./Controllers/bookingController');

const app = express();

// Disable cache for all requests
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});


// to trust all the proxy server 
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// implementing CORS origin tou url hosted application to share the resource acroos domain

app.use(cors());
// add the cors to all the incoming request headers.
// allow cross -origin request
// backend - api.natours.com  frontend - natours.com

// app.use(cors({
//   origin: "www.natrous.com"
// }))

// unsimple request like delete, patch, post
// first req will be sent to server, server will verify and send back the response, then the delete value occurs
app.options("*", cors());

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
//app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false, // Turn off default set to customize fully
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // only for dev
        "'unsafe-eval'",   // only for dev
        "https://js.stripe.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        "http://127.0.0.1:2000",
        "ws://localhost:1234"
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",     // ✅ CRUCIAL for iframes
        "https://hooks.stripe.com"   // ✅ Optional but useful for Stripe
      ],
      imgSrc: ["'self'", "data:"],
      formAction: [
        "'self'",
        "https://hooks.stripe.com"   // ✅ Needed if using redirect/Checkout
      ],
    },
  })
);

// to compress response of the API
app.use(compression());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false // disables internal warning
});
app.use('/api', limiter);

//app.use("/webcheckout-sessions", express.raw({ type: 'application/json' }), bookingController.createBookingCheckout)
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // to data from form submit action method
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
