let pesquisa = document.getElementById('buscaCidade');
let latitude
let longitude
let key = '1a97894415e52f2105e5967b788f266b';
let units = 'metric'
let app = document.querySelector('.app')
let temperatura

async function buscarCidade() {
    const apiKey = 'a286db27e3ec459ca4501730243107';
    const url = `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${pesquisa.value}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        latitude = data[0].lat
        longitude = data[0].lon
        previsao()
      } catch (error) {
        console.error('Error:', error);
    }    
}

async function previsao(){
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&lang=pt_br&appid=${key}`

    try {
        let response = await fetch(url);
        let data = await response.json();
        if(data){
              temperatura= Math.ceil(data.main.temp);
        }
    } catch (e) {
        console.error(e.message);
    }
let responsetemp = document.getElementById('temperaturacidade')
console.log(responsetemp);
responsetemp.innerHTML = ``
}