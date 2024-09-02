let pesquisa = document.getElementById('buscaCidade');
let latitude = -20.8;
let longitude = -51.72;
let nomeCidade = "Tres Lagoas";
let key = 'a286db27e3ec459ca4501730243107';
let units = 'metric';
let app = document.querySelector('.app');
let temperatura, tempMin, tempMax, umidade, sensacao, vento, clima, nascerDoSol, porDoSol, chanceDeChuva;
let indiceCarrossel = 0;
const agora = new Date();
const horas = agora.getHours();

async function buscarCidade(event) {
    event.preventDefault();
    const url = `http://api.weatherapi.com/v1/search.json?key=${key}&q=${pesquisa.value}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length === 0) {
            alert('Nenhuma cidade encontrada')
            return
        }
        latitude = data[0].lat;
        longitude = data[0].lon;
        nomeCidade = data[0].name;
        previsao();
    } catch (error) {
        console.error('Error:', error);
    }
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
            if (clima == 'Sol') clima = 'Ensolarado';
            
            nascerDoSol = formatarHorario(data.forecast.forecastday[0].astro.sunrise);
            porDoSol = formatarHorario(data.forecast.forecastday[0].astro.sunset);
            chanceDeChuva = data.forecast.forecastday[0].day.daily_chance_of_rain;

            atualizarUI(data.forecast.forecastday);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


function atualizarClasseApp() {
    if (horas >= 5 && horas < 18) {
        app.classList.add('appDia');
        app.classList.remove('appNoite');
    } else {
        app.classList.add('appNoite');
        app.classList.remove('appDia');
    }
}

function formatarHorario(horario) {
    const [time, modifier] = horario.split(' ');
    let [hours, minutes] = time.split(':');

    if (modifier === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
    }

    if (modifier === 'AM' && hours === '12') {
        hours = '00';
    }

    return `${hours}:${minutes}`;
}

function selecionarIconeClima() {
    if (temperatura > 25 || clima == "Ensolarado") {
        if(horas >= 5 && horas < 18) return '/assets/sun.svg';
        else return '/assets/moon.svg'
    }
    else if (chanceDeChuva > 60) {
        if (chanceDeChuva > 90) {
            return '/assets/thunder.svg';
        }
        return '/assets/rainy.svg';
    } else if (clima == "Neblina") {
        return '/assets/very_cloudy.svg'
    }
    else if ((temperatura >= 15 && temperatura <= 25) || clima == "Parcialmente Nublado") {
        if(horas >= 5 && horas < 18) return '/assets/cloudy.svg';
        else return '/assets/cloudyNight.svg'
    } else {
        return '/assets/snowy.svg';
    }
}

function atualizarUI(forecastDays) {
    let headerClima = document.querySelector('.climaDesc');
    let responsetemp = document.querySelector('.containerInfo');
    let sessaoPorDoSol = document.querySelector('#sessao-por-do-sol');

    headerClima.innerHTML = `<p class="informacoes">${clima}</p>`;

    const iconeClimaHoje = selecionarIconeClima();

    responsetemp.innerHTML = `
        <div class="temperaturaGrafico">
            <div id="temperaturacidade">
                <div class="tempEClima">
                    <div class="celsiusSpace">
                        <h1 id="numeroTemp">${temperatura}</h1><p id="celsius">°C</p>
                    </div>
                    <div id="divIconClima"><img src="${iconeClimaHoje}" id="iconClima" alt=""></div>
                </div>
                <div><span class="nomeCidade">${nomeCidade}</span><img src="/assets/location.svg" id="locationIcon" alt=""></div>
                <div class="minmax">
                    <span>Max ${tempMax}° - Mín ${tempMin}°</span>
                    <span>Sensação Térmica ${sensacao}°</span>
                </div>
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
            <img class="nascer" src="assets/yellow_sunset.png" alt="Nascer do Sol">
            <img class="arrow" src="assets/arrow1.png" alt="Nascer do Sol">
            <p class="item-temperatura">${nascerDoSol}</p>
        </div>
        <div class="porDoSol">
            <img class="nascer" src="assets/orange_sunset.png" alt="Pôr do Sol">
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

    for (let i = 0; i < diasDaSemana.length; i++) {
        const diaDaSemanaIndex = (hoje + i) % diasDaSemana.length;
        const forecast = forecastDays[index];

        carrosselItens.innerHTML += `
        <div class="item-clima carrosel">
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

    const larguraItem = itens[0].clientWidth + 15;
    carrossel.style.transform = `translateX(${-indiceCarrossel * larguraItem}px)`;
}

document.addEventListener('DOMContentLoaded', function() {
    previsao();
    atualizarClasseApp();

    document.querySelector('.btn-esquerda').addEventListener('click', () => moverCarrossel(-1));
    document.querySelector('.btn-direita').addEventListener('click', () => moverCarrossel(1));
});