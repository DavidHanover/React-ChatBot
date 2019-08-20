const fetch = require("node-fetch");

const { OPENWEATHER_API_KEY } = process.env;

const getWeatherInfo = city =>
  fetch(
    `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`
  )
    .then(response => response.json())
    .then(data => {
      const weather = data;
      const kelvin = weather.main.temp;
      const farenheit = Math.round((kelvin - 273.15) * 1.8 + 32);
      const description = weather.weather[0].description;
      const windSpeed = Math.round(weather.wind.speed * 2.237);
      const humidity = weather.main.humidity;
      return {
        temp: farenheit,
        desc: description,
        speed: windSpeed,
        humidity: humidity
      };
    })
    .catch(error => console.log(error));

module.exports = getWeatherInfo;
