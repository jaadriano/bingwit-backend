'use strict';

const body_parser       = require('body-parser');
const compression       = require('compression');
const cors              = require('cors');
const morgan            = require('morgan');
const express           = require('express');
const helmet            = require('helmet');
const app               = express();
const server            = require('http').Server(app);
const io                = require('socket.io')(server);
const config            = require(`${__dirname}/config/configuration`);
const util              = require(`${__dirname}/helpers/util`);
const socket            = require(`${__dirname}/helpers/socket`);
const winston           = util.winston_logger;

/* Import global functions */
require('./global_function');

/* Set environment configuration */
app.set('env', config.ENV);

/* Set logger middlewares */
winston.info(`Starting ${config.APP_NAME} on ${config.ENV} environment`);
app.use(morgan('combined', {stream: util.configure_logger(config.LOGS_DIR)}));

/* Express app configuration */
winston.verbose(`Binding 3rd party middlewares`);
app.use(cors());
app.use(helmet());
app.set('case sensitive routing', true);
app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());
app.use(compression());

/* API routes */
app.use('/api/v1', require(`${__dirname}/config/router`)(express.Router()));
app.use('(/)', (req, res, next) => {return res.redirect('/api/v1')});
app.use((req, res, next) => {return ReE(res, 'Resource not found', 404)});

/* Initialize PORT */
let port = process.env.PORT  || config.PORT;
winston.verbose(`Socket initializing on port ${port}`);

/* Initialize socket.IO */
socket.initializeSocket(io);

server.listen(port, () => {winston.info(`Server listening on port ${port}`);});