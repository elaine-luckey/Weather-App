// getElementById and querySelector for all elements on the page
const searchForm = document.querySelector('.search-form')
const cityName = document.getElementById('city-name');
const searchBtn = document.getElementById('search-btn')
const section = document.querySelector('section')
const nextFiveDays = document.querySelector('.next-five-days')
const searchedCities = document.querySelector('.searched-cities')

// Personal OpenWeatherMap API private key
const myAPIKey = 'f0ce0b5225dc4e022176e57bc2a80193';

// Declaring global variables for cityList and city
let cityList = []
let city = ''

// Declaring the function fetchData that passes the parameter of cityName
const fetchData = (cityName) => {
//Declaring a const variable for the OpenWeatherMap API URL and including the cityName and myAPI key as parameters in the URL
    const requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${myAPIKey}`

    //Fetch is used to make an HTTP request to the requestURL and it returns a promise that resolves to the response from the server
    fetch(requestURL)
        .then((response) => {
            if (response.ok) {
                section.classList.remove('hide')
                addCityToList(cityName)
                return response.json()
            } else {
                return
            }
        })
        //.then handles the response
        .then((data) => {
            // call OpenWeatherMap API for five day forecast
            fetchFiveDays(cityName)

            // Sets the current city, date, weather icon, temperature, wind speed, and humidity for each search
            document.getElementById('current-city').innerText = data.name
            document.getElementById('current-date').innerText = new Date().toLocaleDateString()
            document.getElementById('current-icon').innerHTML = `<img src='http://openweathermap.org/img/w/${data.weather[0].icon}.png' />`
            document.getElementById('current-temp').innerText = `Temp: ${data.main.temp}°F`
            document.getElementById('current-wind').innerText = `Wind: ${data.wind.speed} MPH`
            document.getElementById('current-humidity').innerText = `Humidity: ${data.main.humidity}%`

            console.log(data)
        })
}

// Defining an asynchronous function that takes the parameter cityName
const fetchFiveDays = async (cityName) => {

//Declaring the const variable requestURL to add the cityName and myAPIKey to query the OpenWeatherMap API
    const requestURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=${myAPIKey}`

//Fetching the API and assigning it to the response - await is used so the code will not execute before the API is fetched
    const response = await fetch(requestURL)

//Getting the json from the response and assigning it to the data variable - using await again to ensure the last line executes before this line
    const data = await response.json()

//Clearing any existing content
    nextFiveDays.innerHTML = ''

//Looping through the block of code 5 times to dynamically generate the date, weather icon, temperature, wind speed, and humidity for each day in the location the user searched for.
    for (let i = 0; i < 5; i++) {
        const nextDayForecast = document.createElement('div')
        nextDayForecast.classList.add('day')
        nextDayForecast.innerHTML = `
            <h3>${new Date(((data.list[0].dt) * 1000) + ((i + 1) * 86400000)).toLocaleDateString()}</h3>
            <img id="day-icon" src='http://openweathermap.org/img/wn/${data.list[7 + (8 * i)].weather[0].icon}.png' />
            <p>Temp: ${data.list[7 + (8 * i)].main.temp}°F</p>
            <p>Wind: ${data.list[7 + (8 * i)].wind.speed} MPH</p>
            <p>Humidity: ${data.list[7 + (8 * i)].main.humidity}%</p>
        `
        nextFiveDays.appendChild(nextDayForecast)
        }
}

//Defining a function and passing a parameter of cityName
const caseSensitivity = (cityName) => {

//converting cityName to lower case and splitting the array with a space in between
    let updateCity = cityName.toLowerCase().split(" ");
//declaring returnCity as an empty string
    let returnCity = '';
    
// for loop to display the cities correctly
    for (let i = 0; i < updateCity.length; i++) {
        updateCity[i] = updateCity[i][0].toUpperCase() + updateCity[i].slice(1);
        returnCity += " " + updateCity[i];
    }
//return returnCity and trim any excess whitespace
    return returnCity.trim();
}

//Add previous city searches to the search history
const addCityToList = (city) => {
    let newCity = caseSensitivity(city)

    let exist = false
    
//If the city already exists do not display the city again, so the exist equals true
    for (let c of cityList) {
        if (c === newCity) {
            exist = true
        }
    }

//if it does not exist, add the new city to the front of the array
    if (!exist) {
        cityList.unshift(newCity)
//create a new button for the new city and at it to the top
        const cityBtn = document.createElement('button')
        cityBtn.classList.add('city-btn')
        cityBtn.innerText = `${cityList[0]}`
        searchedCities.prepend(cityBtn) 
    } else {
        return
    }
    
//if the cityList is greater than 8, remove the last city that is on the list
    if (cityList.length > 8) {
        let nodes = document.querySelectorAll('.city-btn')
        let last = nodes[nodes.length - 1]
        last.remove()

        cityList.pop()
    }

//store the cityList to the local storage
    localStorage.setItem('cities', JSON.stringify(cityList))

    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.removeEventListener('click', fetchData)
        btn.addEventListener('click', (e) => {
            fetchData(e.target.innerText)
        })
    })
}

//get local storage of the array for the previous searched cities
const getLocalStorage = () => {
    const storageList = JSON.parse(localStorage.getItem('cities'))

//if there are no cities on the list, return false
    if (!storageList) {
        return false
    }

    cityList = storageList

    addStorageList()
}

//Add cities to the search history
const addStorageList = () => {
    if (cityList.length > 0) {
        cityList.forEach(city => {
            const cityBtn = document.createElement('button')
            cityBtn.classList.add('city-btn')
            cityBtn.innerText = `${city}`
            searchedCities.append(cityBtn) 
        })
    } else if (cityList.length > 8) {
        let nodes = document.querySelectorAll('.city-btn')
        let last = nodes[nodes.length - 1]
        last.remove()
        cityList.pop()
    } else {
        return
    }

    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.removeEventListener('click', fetchData)
        btn.addEventListener('click', (e) => {
            fetchData(e.target.innerText)
        })
    })   
}

//once the data is fetched from the API, clear the search box after the search is completed
const onFormSubmit = (event) => {
    event.preventDefault()
    
    city = cityName.value
    
    cityName.value = ''

//if the user enters a city, fetch the data. if the user does not enter a city, send an error message
    if (city) {
        fetchData(city)
    } else {
        alert("Please enter a city to continue!")
        return
    }
}

//event listener for the search
searchForm.addEventListener('submit', onFormSubmit)

//grab the local storage from the start of the page
getLocalStorage()