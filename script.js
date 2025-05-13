// Description: This script handles the weather application functionality, including fetching weather data from OpenWeatherMap API, displaying current and forecasted weather, and managing a search history of cities.
// It also includes a dropdown for previously searched cities and allows users to click on them to quickly search again.
// DOM elements and API key
const citySearch = document.getElementById("city-search");
const searchButton = document.getElementById("search-btn");
const locationButton = document.getElementById("location-btn");
const currentWeatherDiv = document.getElementById("current-weather");
const weatherCardsDiv = document.getElementById("weather-cards");
const dropList = document.getElementById("drop_list");
const dropListCities = document.getElementById("dropList_cities");
const API_KEY = "0b436591990a0da4a6a3e4a3148c9f7c";

// Load saved cities from localStorage
const savedCities = JSON.parse(localStorage.getItem("citySearchHistory")) || [];

// Function to render saved cities in the dropdown
const renderSavedCities = () => {
    dropListCities.innerHTML = ""; // Clear the list
    savedCities.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.className = "cursor-pointer px-2 py-1 hover:bg-gray-200";
        li.addEventListener("click", () => {
            citySearch.value = city; // Set clicked city to input
            dropList.classList.add("hidden"); // Hide dropdown
        });
        dropListCities.appendChild(li);
    });
};

// Show dropdown when input is focused
citySearch.addEventListener("focus", () => {
    if (savedCities.length > 0) {
        dropList.classList.remove("hidden");
    }
});

// Hide dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!dropList.contains(e.target) && e.target !== citySearch) {
        dropList.classList.add("hidden");
    }
});

// Save city to history and update dropdown
const saveCity = (city) => {
    if (city && !savedCities.includes(city)) {
        savedCities.push(city);
        localStorage.setItem("citySearchHistory", JSON.stringify(savedCities));
        renderSavedCities();
    }
};

// Update the getCityCoordinates function to save the searched city
const getCityCoordinates = () => {
    const cityName = citySearch.value.trim();
    if (cityName === "") return;
    saveCity(cityName); // Save the city to history
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

// Initial render of saved cities
renderSavedCities();

// Functions to create weather cards and display weather details
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details w-full flex flex-col items-center justify-center gap-1 mt-4 bg-blue-200 text-slate-900 rounded-lg py-2 px-4 shadow-lg shadow-black mb-6">
                    
                    <p class="text-2xl font-bold text-blue-800 mb-2">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</p>
                    <p class="text-gray-700">Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</p>
                    <p class="text-gray-700">Wind: ${weatherItem.wind.speed} M/S</p>
                    <p class="text-gray-700">Humidity: ${weatherItem.main.humidity}%</p> 
                    <div>
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="${weatherItem.weather[0].description}">
                        <p class="text-transform: capitalize text-center">${weatherItem.weather[0].description}</p>
                    </div>
                </div>`;
    } else {
        return `<li class="w-full flex flex-col items-center justify-center gap-1 bg-blue-200 text-slate-900 rounded-lg py-2 px-4 shadow-lg shadow-black">
                    <h3 class="text-blue-800 font-bold mb-2">(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon" class="mx-auto">
                    <h6 class="text-gray-700">Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6 class="text-gray-700">Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6 class="text-gray-700">Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            citySearch.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL)
                .then(response => response.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => {
                    alert("An error occurred while fetching the city name!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
citySearch.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());


