let pesquisa = document.getElementById('buscaCidade');
let latitude = -20.8;
let longitude = -51.72;
let nomeCidade = "Tres Lagoas";
let key = 'a286db27e3ec459ca4501730243107';
let units = 'metric';
let app = document.querySelector('.app');
let temperatura, tempMin, tempMax, umidade, sensacao, vento, clima, nascerDoSol, porDoSol, chanceDeChuva;
let indiceCarrossel = 0;

async function buscarCidade(event) {
    event.preventDefault();
    const url = `http://api.weatherapi.com/v1/search.json?key=${key}&q=${pesquisa.value}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        latitude = data[0].lat;
        longitude = data[0].lon;
        nomeCidade = data[0].name;
        previsao();
    } catch (error) {
        console.error('Error:', error);
    }
}

function formatarHorario(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

async function previsao() {
    let url = `http://api.weatherapi.com/v1/forecast.json?q=${nomeCidade}&days=3&key=${key}&lang=pt`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        if (data) {
            temperatura = Math.ceil(data.current.temp_c);
            tempMin = Math.ceil(data.forecast.forecastday[0].day.mintemp_c);
            tempMax = Math.ceil(data.forecast.forecastday[0].day.maxtemp_c);
            sensacao = Math.ceil(data.current.feelslike_c);
            umidade = data.current.humidity;
            vento = Math.ceil(data.current.wind_kph);
            clima = data.current.condition.text;
            if(clima == 'Sol') clima = 'Ensolarado'
            nascerDoSol = data.forecast.forecastday[0].astro.sunrise;
            porDoSol = data.forecast.forecastday[0].astro.sunset;
            chanceDeChuva = data.forecast.forecastday[0].day.daily_chance_of_rain;

            atualizarUI(data.forecast.forecastday);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    if(data == []){
        alert('bur')
    }
}

function selecionarIconeClima() {
    if (chanceDeChuva > 60) { // Alta chance de chuva
        if (chanceDeChuva > 90) { // Chuva muito alta
            return '/assets/thunder.svg';
        }
        return '/assets/rainy.svg';
    } 
    else if (temperatura > 25 || clima == "Ensolarado") {
        return '/assets/sun.svg';
    }else if ((temperatura >= 15 && temperatura <= 25) || clima == "Parcialmente Nublado") {
        return '/assets/cloudy.svg';
    } else if (temperatura >= 5 && temperatura < 15) {
        return '/assets/very_cloudy.svg';
    } else {
        return '/assets/snowy.svg';
    }
}

function atualizarUI(forecastDays) {
    let responsetemp = document.querySelector('.containerInfo');
    let headerClima = document.querySelector('.climaDesc');
    let sessaoPorDoSol = document.querySelector('#sessao-por-do-sol');

    headerClima.innerHTML = `<p class="informacoes">${clima}</p>`;

    const iconeClimaHoje = selecionarIconeClima();

    responsetemp.innerHTML = `
        <div class="temperaturaGrafico">
            <div id="temperaturacidade">
                <div class="item"><h1 id="numeroTemp">${temperatura}</h1><p class="celsius">°C</p></div>
                <div class="mainClima"><img src="${iconeClimaHoje}" alt=""></div>
            </div>
            <div>
                <div class="item"><span class="nomeCidade">${nomeCidade}</span><img src="/assets/location.svg" id="locationIcon" alt=""></div>
                <div class="item"><span>Max ${tempMax}°C - Mín ${tempMin}°C</span><span>Sensação Térmica ${sensacao}°C</span></div>
            </div>
        </div>
        <div class="climaStatus">
            <div class="climaStatusItems">
                <div class="itemInfo"><img id="statusIcons" src="/assets/chuva.svg" alt=""><span>Chuva</span></div>
                <span>${chanceDeChuva}%</span>
            </div>
               <div class="climaStatusItems">
                <div class="itemInfo"><img id="statusIcons" src="/assets/umidade.svg" alt=""><span>Umidade</span></div>
                 <span>${umidade}%</span>
            </div>
               <div class="climaStatusItems">
                <div class="itemInfo"><img id="statusIcons" src="/assets/vento.svg" alt=""><span>Vento</span></div>
                <span>${vento}km/h</span>
            </div>        
        </div>
    `;

    sessaoPorDoSol.innerHTML = `
        <div class="porDoSol">
            <img src="assets/yellow_sunset.svg" alt="Nascer do Sol">
            <img class="arrow" src="assets/arrow1.png" alt="Nascer do Sol">
            <p class="item-temperatura">${nascerDoSol}</p>
        </div>
        <div class="porDoSol">
            <img src="assets/orange_sunset.svg" alt="Pôr do Sol">
            <img class="arrow" src="assets/arrow2.png" alt="Pôr do Sol">
            <p class="item-temperatura">${porDoSol}</p>
        </div>
    `;

    atualizarCarrossel(forecastDays);
}

function atualizarCarrossel(forecastDays) {
    const diasDaSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const carrosselItens = document.querySelector('.carrossel-itens');

    carrosselItens.innerHTML = '';

    const hoje = new Date().getDay();
    let index = 0;

    // Iniciar o carrossel com o dia de hoje
    for (let i = 0; i < diasDaSemana.length; i++) {
        const diaDaSemanaIndex = (hoje + i) % diasDaSemana.length;
        const forecast = forecastDays[index];

        carrosselItens.innerHTML += `
        <div class="item-clima">
            <p class="diaSemana">${diasDaSemana[diaDaSemanaIndex]}</p>
            <img src="${forecast.day.condition.icon}" alt="${forecast.day.condition.text}">
            <p class="item-temperatura">${Math.ceil(forecast.day.avgtemp_c)} °C</p>
        </div>
        `;

        index = (index + 1) % forecastDays.length;
    }
}

function moverCarrossel(direcao) {
    const carrossel = document.querySelector('.carrossel-itens');
    const itens = document.querySelectorAll('.carrossel-itens .item-clima');
    const totalItens = itens.length-1;

    indiceCarrossel += direcao;

    if (indiceCarrossel < 0) {
        indiceCarrossel = totalItens;
    } else if (indiceCarrossel >= totalItens) {
        indiceCarrossel = 0;
    }

    const larguraItem = itens[0].clientWidth + 40;
    carrossel.style.transform = `translateX(${-indiceCarrossel * larguraItem}px)`;
}

document.addEventListener('DOMContentLoaded', function() {
    previsao();

    document.querySelector('.btn-esquerda').addEventListener('click', () => moverCarrossel(-1));
    document.querySelector('.btn-direita').addEventListener('click', () => moverCarrossel(1));
});
