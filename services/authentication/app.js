const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const AppError = require('./utilis/appError');
const { globalerrorHandler } = require('./controllers/errorController');

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.send('Authentication service running ✅'));
app.use('/users', userRoutes);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});



app.use(globalerrorHandler);

module.exports = app;