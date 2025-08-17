 const apiKey = "418c6d610a70b0b1dba70349336f51fe";
        const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
        const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
        
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const weatherInfo = document.getElementById('weather-info');
        const errorMessage = document.getElementById('error-message');
        const loading = document.querySelector('.loading');
        const forecast = document.getElementById('forecast');
        const forecastContainer = document.getElementById('forecast-container');
        const celsiusBtn = document.getElementById('celsius-btn');
        const fahrenheitBtn = document.getElementById('fahrenheit-btn');
        
        let currentUnit = 'celsius';
        let currentTemp = 0;
        
        // Weather icon mapping
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
        
        // Get current location weather
        function getCurrentLocationWeather() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        fetch(`${weatherApiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`)
                            .then(response => response.json())
                            .then(data => displayWeatherData(data))
                            .catch(error => showError("Failed to get your location weather"));
                    },
                    (error) => {
                        showError("Location access denied. Please search manually.");
                    }
                );
            } else {
                showError("Geolocation is not supported by your browser");
            }
        }
        
        // Check weather for searched city
        async function checkWeather(city) {
            if (!city) {
                showError("Please enter a city name");
                return;
            }
            
            loading.style.display = 'block';
            weatherInfo.style.display = 'none';
            forecast.style.display = 'none';
            errorMessage.style.display = 'none';
            
            try {
                // Get current weather
                const weatherResponse = await fetch(weatherApiUrl + city + `&appid=${apiKey}`);
                if (!weatherResponse.ok) throw new Error("City not found");
                const weatherData = await weatherResponse.json();
                
                // Get forecast
                const forecastResponse = await fetch(forecastApiUrl + city + `&appid=${apiKey}`);
                if (!forecastResponse.ok) throw new Error("Forecast not available");
                const forecastData = await forecastResponse.json();
                
                displayWeatherData(weatherData);
                displayForecastData(forecastData);
            } catch (error) {
                showError(error.message || "Failed to fetch weather data");
            } finally {
                loading.style.display = 'none';
            }
        }
        
        // Display weather data
        function displayWeatherData(data) {
            currentTemp = data.main.temp;
            
            document.getElementById('city').textContent = data.name;
            document.getElementById('temperature').textContent = Math.round(currentTemp);
            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('wind').textContent = `${data.wind.speed} km/h`;
            
            // Set weather icon
            const weatherIconCode = data.weather[0].icon;
            const weatherIcon = document.getElementById('weather-icon');
            weatherIcon.className = `fas ${weatherIcons[weatherIconCode] || 'fa-cloud'}`;
            
            // Update unit display
            updateTemperatureDisplay();
            
            weatherInfo.style.display = 'block';
            errorMessage.style.display = 'none';
        }
        
        // Display forecast data
        function displayForecastData(data) {
            forecastContainer.innerHTML = '';
            
            // Group forecast by day (we'll take one reading per day at noon)
            const dailyForecast = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                const hour = date.getHours();
                
                // Only take one reading per day (around noon)
                if (hour >= 11 && hour <= 13 && !dailyForecast[day]) {
                    dailyForecast[day] = item;
                }
            });
            
            // Display next 5 days forecast
            Object.entries(dailyForecast).slice(0, 5).forEach(([day, item]) => {
                const forecastDay = document.createElement('div');
                forecastDay.className = 'forecast-day';
                
                const iconCode = item.weather[0].icon;
                const iconClass = weatherIcons[iconCode] || 'fa-cloud';
                
                forecastDay.innerHTML = `
                    <p>${day}</p>
                    <i class="fas ${iconClass}"></i>
                    <h4>${Math.round(item.main.temp)}°</h4>
                    <p>${item.weather[0].main}</p>
                `;
                
                forecastContainer.appendChild(forecastDay);
            });
            
            forecast.style.display = 'block';
        }
        
        // Show error message
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            weatherInfo.style.display = 'none';
            forecast.style.display = 'none';
        }
        
        // Update temperature display based on selected unit
        function updateTemperatureDisplay() {
            const tempElement = document.getElementById('temperature');
            if (currentUnit === 'celsius') {
                tempElement.textContent = Math.round(currentTemp);
            } else {
                tempElement.textContent = Math.round((currentTemp * 9/5) + 32);
            }
        }
        
        // Event listeners
        searchBtn.addEventListener('click', () => {
            const city = searchInput.value.trim();
            if (city) {
                checkWeather(city);
            } else {
                showError("Please enter a city name");
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = searchInput.value.trim();
                if (city) {
                    checkWeather(city);
                } else {
                    showError("Please enter a city name");
                }
            }
        });
        
        celsiusBtn.addEventListener('click', () => {
            if (currentUnit !== 'celsius') {
                currentUnit = 'celsius';
                celsiusBtn.classList.add('active');
                fahrenheitBtn.classList.remove('active');
                updateTemperatureDisplay();
            }
        });
        
        fahrenheitBtn.addEventListener('click', () => {
            if (currentUnit !== 'fahrenheit') {
                currentUnit = 'fahrenheit';
                fahrenheitBtn.classList.add('active');
                celsiusBtn.classList.remove('active');
                updateTemperatureDisplay();
            }
        });
        
        // Initialize with current location weather
        window.addEventListener('load', () => {
            getCurrentLocationWeather();
        });
