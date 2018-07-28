// Dependencies
const nightmare = require('nightmare');
const nodemailer = require('nodemailer');
const winston = require('winston');
const moment = require('moment-timezone');
const asyncjs = require('async');

// Constants
const LOGIN_PAGE = 'https://stackoverflow.com/users/login';

// Config
const config = {
  general: {
    time_zone       : process.env.TIME_ZONE,
    report_to_email : process.env.REPORT_TO_EMAIL,
  },
  smtp: {
    host     : process.env.SMTP_HOST,
    port     : process.env.SMTP_PORT,
    username : process.env.SMTP_USERNAME,
    password : process.env.SMTP_PASSWORD,
  },
  stackoverflow: {
    email    : process.env.STACKOVERFLOW_EMAIL,
    password : process.env.STACKOVERFLOW_PASSWORD,
  },
};

// Logger
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint(),
  ),
  transports: [new winston.transports.Console()],
});

// Create mailer
const mailer = nodemailer.createTransport({
  host : config.smtp.host,
  port : config.smtp.port,
  auth : {
    user : config.smtp.username,
    pass : config.smtp.password,
  },
});

// Create Visit StackOverflow retryable task
const task = asyncjs.retryable({
  times    : 10,
  interval : (times) => times * 500,
}, (done) => {
  nightmare({
    show             : true,
    waitTimeout      : 10000,
    gotoTimeout      : 10000,
    loadTimeout      : 10000,
    executionTimeout : 10000,
  })
    .goto(LOGIN_PAGE)
    .wait('#login-form')
    .type('#email', config.stackoverflow.email)
    .type('#password', config.stackoverflow.password)
    .click('#submit-button')
    .wait('a.my-profile')
    .click('a.my-profile')
    .wait('#top-cards')
    .evaluate(() => {
      const element = document.querySelector('#top-cards span.-count');
      return element ? element.innerText : 'null';
    })
    .end()
    .then((progressText) => done(null, progressText))
    .catch((err) => done(err));
});

// Run Visit StackOverflow task
task((err, progressText) => {
  if (err) {
    logger.error('Failed visiting StackOverflow', err);
    mailer.sendMail({
      from    : '"Bot" <bot@nmtuan.space>',
      to      : config.general.report_to_email,
      subject : `[${moment(Date.now()).tz(config.general.time_zone).format('YYYY-MM-DD')}] StackOverflow Fanatic Badge Daily Report (Error)`,
      text    : `Hi boss. Something went wrong: ${err}`,
    }, (sendMailErr, info) => {
      if (sendMailErr) logger.error('Failed to send error report email', sendMailErr);
      else logger.info('Error report email sent', { messageId: info.messageId });
    });
    return;
  }

  logger.info(`Finish visiting StackOverflow. Progress: ${progressText}`);
  mailer.sendMail({
    from    : '"Bot" <bot@nmtuan.space>',
    to      : config.general.report_to_email,
    subject : `[${moment(Date.now()).tz(config.general.time_zone).format('YYYY-MM-DD')}] StackOverflow Fanatic Badge Daily Report (${progressText})`,
    text    : `Hi boss. I've been visiting StackOverflow on your behalf. Here is the current streak: ${progressText}`,
  }, (err, info) => {
    if (err) logger.error('Failed to send progress report email', err);
    else logger.info('Progress report email sent', { messageId: info.messageId });
  });
});
