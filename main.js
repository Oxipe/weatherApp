
var myChart;

fetch("https://api.openweathermap.org/data/2.5/forecast?q=Amsterdam&APPID=5361fa32475cefee51d0dc487bd65987")
    .then(function (response) {
        response.json()
            .then(function (data) {

                app = new Vue({
                    el: "#weatherApp",
                    created: function () {
                        this.cityName = data.city.name;
                        this.flag = "https://www.countryflags.io/" + data.city.country + "/shiny/24.png";
                        this.weatherIcon = "images/weather_icons/" + data.list[0].weather[0].icon + ".png";
                        this.weather = data;
                        this.changeDirection(data.list[0].wind.deg);
                        this.removeLoadingIcon();
                    },
                    data: {
                        weather: [],
                        cityName: "",
                        citySearch: [],
                        celcius: true,
                        fahrenheit: false,
                        isLoaded: false,
                        flag: "",
                        weatherIcon: "",
                        daysOfForcast: 8

                    },
                    methods: {
                        calculateCelcius: function (value) {
                            var temp = value - 273.15;
                            return temp.toFixed(1) + "&deg";
                        },
                        changeDirection: function (value) {
                            document.getElementById("windIcon").style.transform = "rotate(" + value + "deg)";
                        },
                        checkFilter: function (value) {
                            if (!value) {
                                if (document.getElementById("temperature").checked) value = "temperature";
                                else if (document.getElementById("rain").checked) value = "rain";
                                else if (document.getElementById("humidity").checked) value = "humidity";
                                else if (document.getElementById("pressure").checked) value = "pressure";
                                else if (document.getElementById("windSpeed").checked) value = "wind_speed";
                            }
                            generateChart(this.weather, this.celcius, value, this.daysOfForcast);
                        },
                        calculateFahrenheit: function (value) {
                            var temp = value * 9 / 5 - 457.87;
                            return temp.toFixed(1) + "&deg";
                        },
                        calculateFeetPerSecond: function (value) {
                            return (value / 0.3048).toFixed(2) + " f/s";
                        },
                        selectCity: function (name) {
                            document.getElementById("searchBox").value = name;
                            this.searchCity(name);
                        },
                        fetchCity: function () {
                            var input = document.getElementById("searchBox").value;

                            document.getElementById("searchBox").value = "";

                            fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + input + "&APPID=5361fa32475cefee51d0dc487bd65987")
                                .then(function (response) {
                                    response.json()
                                        .then(function (data) {
                                            app.cityName = data.city.name;
                                            app.flag = "https://www.countryflags.io/" + data.city.country + "/shiny/24.png";
                                            app.weatherIcon = "images/weather_icons/" + data.list[0].weather[0].icon + ".png";
                                            app.changeDirection(data.list[0].wind.deg);
                                            app.weather = data;
                                        });
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                            this.citySearch = [];
                        },
                        getNumberOfDays(value) {
                            this.daysOfForcast = value * 8;
                        },
                        insertHectopascal: function (value) {
                            return value + " hPa";
                        },
                        insertPercentage: function (value) {
                            return value + "&#37;";
                        },
                        insertWindSpeed: function (value) {
                            return value + " m/s";
                        },
                        getTime: function (value) {
                            return convertTime(value);
                        },
                        searchCity: function () {
                            this.citySearch = [];

                            var input = document.getElementById("searchBox").value.toLowerCase();

                            if (input) {
                                input = new RegExp(input);

                                var number = 0;
                                while (this.citySearch.length < 10 && number < cities.length) {

                                    if (input.test(cities[number].name.toLowerCase())) {
                                        this.citySearch.push(cities[number]);
                                    }

                                    number++;
                                }
                            }
                        },
                        removeLoadingIcon: function () {
                            this.isLoaded = true;
                            document.getElementById("mainContainer").style.visibility = "visible";
                            document.getElementById("searchDropDown").style.visibility = "visible";
                        }
                    }
                });

            });
    })
    .catch(function (error) {
        console.log(error);
    });

Vue.component("divider", {
    template: "<div class='divider'></div>"
});


function searchCity() {
    weatherApp.citySearch = [];

    var input = document.getElementById("searchBox").value.toLowerCase();

    if (input) {
        input = new RegExp(input);

        var number = 0;
        while (weatherApp.citySearch.length < 10 && number < cities.length) {

            if (input.test(cities[number].name.toLowerCase())) {
                weatherApp.citySearch.push(cities[number]);
            }

            number++;
        }
    }
}

function convertToFeet(value) {
    return (value / 0.3048).toFixed(2)
}

function convertToCelcius(value) {
    var temp = value - 273.15;
    return temp.toFixed(1);
}

function convertToFahrenheit(value) {
    var temp = value * 9 / 5 - 457.87;
    return temp.toFixed(1);
}

function convertTime(value) {
    var date = new Date(value * 1000);
    return date.getHours() + ":00";
}

function generateChart(data, celcius, value, days) {
    var arrayOfHours = [];
    var arrayOfValues = [];

    var label;
    for (var i = 0; i < days; i++) {
        arrayOfHours.push(convertTime(data.list[i].dt));
        switch (value) {
            case "temperature": celcius ? arrayOfValues.push(convertToCelcius(data.list[i].main.temp)) : arrayOfValues.push(convertToFahrenheit(data.list[i].main.temp));
                label = "Temperature";
                break;
            case "rain": !data.list[i].rain ? arrayOfValues.push(0) : arrayOfValues.push(data.list[i].rain["3h"]);
                label = "Rain";
                break;
            case "humidity": arrayOfValues.push(data.list[i].main.humidity);
                label = "Humidity";
                break;
            case "pressure": arrayOfValues.push(data.list[i].main.pressure);
                label = "Pressure";
                break;
            case "wind_speed": celcius ? arrayOfValues.push(data.list[i].wind.speed) : arrayOfValues.push(convertToFeet(data.list[i].wind.speed));
                label = "Wind speed";
                break;
            default:
        }
    }

    var ctx = document.getElementById("myChart").getContext('2d');

    if (myChart !== undefined)
        myChart.destroy();

    switch (days) {
        case 8:
            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [arrayOfHours[0], arrayOfHours[1], arrayOfHours[2], arrayOfHours[3], arrayOfHours[4], arrayOfHours[5], arrayOfHours[6], arrayOfHours[7]],
                    datasets: [{
                        label: label,
                        data: [arrayOfValues[0], arrayOfValues[1], arrayOfValues[2], arrayOfValues[3], arrayOfValues[4], arrayOfValues[5], arrayOfValues[6], arrayOfValues[7]],
                        borderColor: "#777",
                        borderWidth: 1
                    }]
                },
                options: {
                    animation: {
                        duration: 0
                    }
                }
            });
            break;
        case 24:
            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [arrayOfHours[0], arrayOfHours[1], arrayOfHours[2], arrayOfHours[3], arrayOfHours[4], arrayOfHours[5], arrayOfHours[6], arrayOfHours[7], arrayOfHours[8], arrayOfHours[9], arrayOfHours[10], arrayOfHours[11], arrayOfHours[12], arrayOfHours[13], arrayOfHours[14], arrayOfHours[15], arrayOfHours[16], arrayOfHours[17], arrayOfHours[18], arrayOfHours[19], arrayOfHours[20], arrayOfHours[21], arrayOfHours[22], arrayOfHours[23]],
                    datasets: [{
                        label: label,
                        data: [arrayOfValues[0], arrayOfValues[1], arrayOfValues[2], arrayOfValues[3], arrayOfValues[4], arrayOfValues[5], arrayOfValues[6], arrayOfValues[7], arrayOfValues[8], arrayOfValues[9], arrayOfValues[10], arrayOfValues[11], arrayOfValues[12], arrayOfValues[13], arrayOfValues[14], arrayOfValues[15], arrayOfValues[16], arrayOfValues[17], arrayOfValues[18], arrayOfValues[19], arrayOfValues[20], arrayOfValues[21], arrayOfValues[22], arrayOfValues[23]],
                        borderColor: "#777",
                        borderWidth: 1
                    }]
                },
                options: {
                    animation: {
                        duration: 0
                    }
                }
            });
            break;
        case 40:
            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [arrayOfHours[0], arrayOfHours[1], arrayOfHours[2], arrayOfHours[3], arrayOfHours[4], arrayOfHours[5], arrayOfHours[6], arrayOfHours[7], arrayOfHours[8], arrayOfHours[9], arrayOfHours[10], arrayOfHours[11], arrayOfHours[12], arrayOfHours[13], arrayOfHours[14], arrayOfHours[15], arrayOfHours[16], arrayOfHours[17], arrayOfHours[18], arrayOfHours[19], arrayOfHours[20], arrayOfHours[21], arrayOfHours[22], arrayOfHours[23], arrayOfHours[24], arrayOfHours[25], arrayOfHours[26], arrayOfHours[27], arrayOfHours[28], arrayOfHours[29], arrayOfHours[30], arrayOfHours[31], arrayOfHours[32], arrayOfHours[33], arrayOfHours[34], arrayOfHours[35], arrayOfHours[36], arrayOfHours[37], arrayOfHours[38], arrayOfHours[39]],
                    datasets: [{
                        label: label,
                        data: [arrayOfValues[0], arrayOfValues[1], arrayOfValues[2], arrayOfValues[3], arrayOfValues[4], arrayOfValues[5], arrayOfValues[6], arrayOfValues[7], arrayOfValues[8], arrayOfValues[9], arrayOfValues[10], arrayOfValues[11], arrayOfValues[12], arrayOfValues[13], arrayOfValues[14], arrayOfValues[15], arrayOfValues[16], arrayOfValues[17], arrayOfValues[18], arrayOfValues[19], arrayOfValues[20], arrayOfValues[21], arrayOfValues[22], arrayOfValues[23], arrayOfValues[24], arrayOfValues[25], arrayOfValues[26], arrayOfValues[27], arrayOfValues[28], arrayOfValues[29], arrayOfValues[30], arrayOfValues[31], arrayOfValues[32], arrayOfValues[33], arrayOfValues[34], arrayOfValues[35], arrayOfValues[36], arrayOfValues[37], arrayOfValues[38], arrayOfValues[39]],
                        borderColor: "#777",
                        borderWidth: 1
                    }]
                },
                options: {
                    animation: {
                        duration: 0
                    }
                }
            });
            break;
    }
}

