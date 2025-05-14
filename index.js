document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('city');
    const searchIcon = document.querySelector('.fa-magnifying-glass');
    const cityName = document.querySelector('.main-heading h1');
    const countryName = document.querySelector('.main-heading h2');
    const tempIcon = document.querySelector('.temp i');
    const tempValue = document.querySelector('.temp h1');
    const feelsLike = document.querySelector('.temp-details p:nth-child(1)');
    const humidity = document.querySelector('.temp-details p:nth-child(2)');
    const wind = document.querySelector('.temp-details p:nth-child(3)');
    const rain = document.querySelector('.temp-details p:nth-child(4)');
    const forecastDays = document.querySelectorAll('.next-4days .day');

    // API Key (replace with your actual API key)
    const API_KEY = '59e29f16bebb66afbf221caf39e73ce3'; // Get from OpenWeatherMap

    // Weather icons mapping
    const weatherIcons = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-rain',
        '09n': 'fa-cloud-rain',
        '10d': 'fa-cloud-sun-rain',
        '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };

    // Fetch weather data
    async function fetchWeather(city) {
        try {
            // Fetch current weather
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            );
            
            if (!currentResponse.ok) {
                throw new Error('City not found');
            }
            
            const currentData = await currentResponse.json();
            updateWeatherUI(currentData);

            // Fetch 5-day forecast (we'll use days 1-4 for the forecast)
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
            );
            
            const forecastData = await forecastResponse.json();
            updateForecastUI(forecastData);
            
        } catch (error) {
            alert(error.message);
            console.error('Error fetching weather data:', error);
        }
    }

    // Update current weather UI
    function updateWeatherUI(data) {
        cityName.textContent = data.name;
        countryName.textContent = data.sys.country;
        tempValue.textContent = `${Math.round(data.main.temp)}°C`;
        feelsLike.textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
        humidity.textContent = `Humidity: ${data.main.humidity}%`;
        wind.textContent = `Wind: ${Math.round(data.wind.speed * 3.6)} km/h`;
        
        const rainProbability = data.rain ? `${data.rain['1h'] || 0}%` : '0%';
        rain.textContent = `Rain: ${rainProbability}`;
        
        const iconCode = data.weather[0].icon;
        const iconClass = weatherIcons[iconCode] || 'fa-cloud-sun';
        tempIcon.className = `fa-solid ${iconClass}`;
    }

    // Update forecast UI
    function updateForecastUI(data) {
        // We'll get one forecast per day (OpenWeatherMap provides forecasts every 3 hours)
        // So we'll take forecasts at 12:00 PM each day for simplicity
        const dailyForecasts = [];
        
        // Group forecasts by day
        const forecastsByDay = {};
        data.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            if (!forecastsByDay[day]) {
                forecastsByDay[day] = [];
            }
            forecastsByDay[day].push(forecast);
        });
        
        // Get one forecast per day (we'll use the midday forecast if available)
        Object.keys(forecastsByDay).forEach(day => {
            const forecasts = forecastsByDay[day];
            const middayForecast = forecasts.find(f => {
                const hours = new Date(f.dt * 1000).getHours();
                return hours >= 11 && hours <= 14;
            }) || forecasts[Math.floor(forecasts.length / 2)];
            
            dailyForecasts.push({
                date: day,
                temp: Math.round(middayForecast.main.temp),
                icon: middayForecast.weather[0].icon
            });
        });
        
        // Update the forecast for the next 4 days (skip today)
        for (let i = 0; i < 4 && i + 1 < dailyForecasts.length; i++) {
            const forecast = dailyForecasts[i + 1]; // Skip today (index 0)
            const dayElement = forecastDays[i];
            
            dayElement.querySelector('h3').textContent = forecast.date;
            dayElement.querySelector('p').textContent = `${forecast.temp}°C`;
            
            const iconClass = weatherIcons[forecast.icon] || 'fa-cloud-sun';
            dayElement.querySelector('i').className = `fa-solid ${iconClass}`;
        }
    }

    // Event listeners
    searchIcon.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = searchInput.value.trim();
            if (city) {
                fetchWeather(city);
            }
        }
    });

    // Default city on load
    fetchWeather('London');
});