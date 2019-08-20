const Dialogflow = require("dialogflow");
const Pusher = require("pusher");
const getWeatherInfo = require("./weather");

const projectID = "firstchatbox-pbofsu";
const sessionID = "123456";
const languageCode = "en-US";

const config = {
  credentials: {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
  }
};

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: true
});

const sessionClient = new Dialogflow.SessionsClient(config);

const sessionPath = sessionClient.sessionPath(projectID, sessionID);

const processMessage = message => {
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode
      }
    }
  };

  sessionClient
    .detectIntent(request)
    .then(responses => {
      const result = responses[0].queryResult;

      // If the intent matches 'detect-city'
      if (result.intent.displayName === "detect-city") {
        const city = result.parameters.fields["geo-city"].stringValue;

        // fetch the temperature from openweather map
        return getWeatherInfo(city).then(weather => {
          if (!weather) {
            return pusher.trigger("bot", "bot-response", {
              message:
                "I'm so sorry! There appears to have been an error.  Please try again!"
            });
          }
          console.dir(weather);
          return pusher.trigger("bot", "bot-response", {
            message: `The weather conditions in ${city} are ${
              weather.desc
            }, & the temperature is ${weather.temp}°F with ${
              weather.speed
            } mph winds & ${weather.humidity}% humidity.`
          });
        });
      }

      return pusher.trigger("bot", "bot-response", {
        message: result.fulfillmentText
      });
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
};
module.exports = processMessage;
