// https://www.twilio.com/docs/usage/tutorials/how-to-set-up-your-node-js-and-express-development-environment
// https://www.twilio.com/docs/sms/tutorials/how-to-send-sms-messages-node-js

// app configuration
const config = { PORT: 3050 };

// validate required environment variables
const envVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'];
envVars.forEach((item) => {
  if (!process.env[item]) {
    console.error(`Environment Variable '${item}' is not defined!`);
    process.exit(1);
  }
  config[item] = process.env[item];
});

var express = require('express');
var path = require('path');

var app = express();
app.use(express.urlencoded({ extended: false }));

const twilio = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/html/index.html'));
});

app.post('/', function(req, res) {
  const phone = req.body.phone;
  const message = req.body.message;

  if (!phone || phone === '' || !message || message === '')
    res.send(getResponse(false, req.body, 'Invalid phone or message'));
  else {
    twilio.messages
      .create({
        body: message,
        from: config.TWILIO_FROM_NUMBER,
        to: phone,
      })
      .then((message) => {
        console.log('SUCCESS!!');
        console.log(message);
        res.send(getResponse(true, req.body));
      })
      .catch((err) => {
        console.log('ERROR!!');
        console.error(err);
        res.send(getResponse(false, req.body, JSON.stringify(err)));
      });
  }
});

function getResponse(success, body, err) {
  let title = 'Success';
  if (!success) title = 'Error';

  let errMessage = '';
  if (err) errMessage = '<p>' + err + '</p>';

  let responseMessage = '<h1>' + title + '!!</h1>';
  responseMessage += '<p>' + JSON.stringify(body) + '</p>';
  responseMessage += errMessage;
  responseMessage += '<br /><a href="/">Go to home</a>';
  return responseMessage;
}

app.listen(config.PORT, function() {
  console.log(`Server listening on port ${config.PORT}!`);
});
