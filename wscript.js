

const apiKey = "418c6d610a70b0b1dba70349336f51fe"; 
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q="; // Use a city, not country
const searcBox = document.querySelector('.search input');
const searchBtn = document.querySelector('.search button');
const description = document.querySelector('.description');
const text = document.querySelector('.text');


async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city +`&appid=${apiKey}`);
    if (!response.ok) throw new Error("Weather data not found");
    const data = await response.json();
    if (!searcBox.value =='') {
        description.style.display = 'block';
    }
    
    
    // Update DOM after successful fetch
    document.querySelector(".city").textContent = data.name;
    document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("wind").textContent = `${data.wind.speed} km/h`;
   
  
    console.log(data);
  } catch (error) {
    console.error("Error fetching weather:", error);
    document.querySelector(".city").textContent = "Location not found";
  }
}




// Call the function
searchBtn.addEventListener("click", ()=>{
  if (navigator.onLine) {
    
    if (searcBox.value=='') {
      text.textContent = "Please Enter City Name!!"
   }  else  {
     text.textContent = ""
     checkWeather(searcBox.value);
   }

  } else {
    // No internet connection
    text.textContent = 'Please connect to the internet';
    description.style.display = 'none'
  }
  });





