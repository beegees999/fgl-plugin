function startPlugin() {
    // Проверка доступности сайта
    checkSiteAvailability();
    
    // Добавление источника в Lampa
    Lampa.source.add({
        title: 'Family Guy',
        onSearch: function(query) {
            searchEpisodes(query);
        },
        onPlay: function(id) {
            playEpisode(id);
        }
    });
}

// Проверка доступности сайта
function checkSiteAvailability() {
    fetch('https://familyguy.mult-fan.tv/')
        .then(response => {
            if (response.ok) {
                console.log('Сайт доступен');
            } else {
                console.log('Ошибка доступа к сайту');
            }
        })
        .catch(error => {
            console.error('Ошибка подключения:', error);
        });
}

// Функция задержки для ограничения запросов
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Поиск серий на сайте
async function searchEpisodes(query) {
    let searchUrl = 'https://familyguy.mult-fan.tv/search/' + encodeURIComponent(query);
    
    try {
        let response = await fetch(searchUrl);
        let data = await response.text();
        
        let episodes = parseEpisodes(data);
        Lampa.Platform.render(episodes);
        
        // Ограничение запросов - задержка 2 секунды между запросами
        await delay(2000);
        
        for (let episode of episodes) {
            await fetchEpisodeDetails(episode.url);
            await delay(2000); // Задержка между запросами
        }
    } catch (error) {
        console.error('Ошибка поиска:', error);
    }
}

// Парсинг страницы для получения списка эпизодов
function parseEpisodes(html) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    let episodes = [];

    // Здесь используется примерный селектор для поиска ссылок на видео
    let episodeLinks = doc.querySelectorAll('.video-block a'); // Обновите селектор, если потребуется
    episodeLinks.forEach(link => {
        let episode = {
            title: link.textContent,
            url: link.href
        };
        episodes.push(episode);
    });

    return episodes;
}

// Получение деталей эпизода
async function fetchEpisodeDetails(url) {
    try {
        let response = await fetch(url);
        let data = await response.text();
        let videoUrl = extractVideoUrl(data);
        
        // Вывод видео в Lampa
        Lampa.Player.play(videoUrl);
    } catch (error) {
        console.error('Ошибка загрузки эпизода:', error);
    }
}

// Извлечение ссылки на видео из HTML
function extractVideoUrl(html) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    
    // Поиск элемента с видео URL
    let videoElement = doc.querySelector('video source');
    return videoElement ? videoElement.src : null;
}

// Инициализация плагина
Lampa.Platform.ready(function() {
    startPlugin();
});
