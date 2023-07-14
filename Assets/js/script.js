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
// ----------------------------------------------------------------------------------------------------------------------------------------------------

const fetchFiveDays = async (cityName) => {
    const requestURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=imperial&appid=${myAPIKey}`

    const response = await fetch(requestURL)

    const data = await response.json()

    nextFiveDays.innerHTML = ''

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
         
    console.log(data)
}

const caseSensitivity = (cityName) => {
    let updateCity = cityName.toLowerCase().split(" ");
    let returnCity = '';
    
    for (let i = 0; i < updateCity.length; i++) {
        updateCity[i] = updateCity[i][0].toUpperCase() + updateCity[i].slice(1);
        returnCity += " " + updateCity[i];
    }
    return returnCity.trim();
}

const addCityToList = (city) => {
    let newCity = caseSensitivity(city)

    let exist = false
    
    for (let c of cityList) {
        if (c === newCity) {
            exist = true
        }
    }

    if (!exist) {
        cityList.unshift(newCity)

        const cityBtn = document.createElement('button')
        cityBtn.classList.add('city-btn')
        cityBtn.innerText = `${cityList[0]}`
        searchedCities.prepend(cityBtn) 
    } else {
        return
    }
    
    if (cityList.length > 8) {
        let nodes = document.querySelectorAll('.city-btn')
        let last = nodes[nodes.length - 1]
        last.remove()

        cityList.pop()
    }
    
    localStorage.setItem('cities', JSON.stringify(cityList))

    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.removeEventListener('click', fetchData)
        btn.addEventListener('click', (e) => {
            fetchData(e.target.innerText)
        })
    })
}

const getLocalStorage = () => {
    const storageList = JSON.parse(localStorage.getItem('cities'))

    if (!storageList) {
        return false
    }

    cityList = storageList

    addStorageList()
}

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

const onFormSubmit = (event) => {
    event.preventDefault()
    
    city = cityName.value
    
    cityName.value = ''

    if (city) {
        fetchData(city)
    } else {
        alert("Please enter a city")
        return
    }
}

searchForm.addEventListener('submit', onFormSubmit)

getLocalStorage()