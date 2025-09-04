// scraper.js en CommonJS
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// URL de la page principale des films
const BASE_URL = 'https://cinepulse.to/play/10c1swh1QbqBhJDNeZHshJw8MJvnvIssuo0DDThBack';

// Fonction pour récupérer tous les films
async function fetchMovies() {
  try {
    const { data } = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    const $ = cheerio.load(data);
    const movies = [];

    $('.movie-card').each((i, el) => {
      const title = $(el).find('.movie-title').text().trim();
      const poster = $(el).find('img').attr('src');
      const linkPage = $(el).find('a').attr('href');

      if (title && poster && linkPage) {
        movies.push({
          title,
          poster: poster.startsWith('http') ? poster : BASE_URL + poster,
          linkPage: linkPage.startsWith('http') ? linkPage : BASE_URL + linkPage
        });
      }
    });

    return movies;
  } catch (error) {
    console.error('Erreur fetchMovies:', error.message);
    return [];
  }
}

// Fonction pour récupérer le lien M3U8 de la page du film
async function fetchM3U8(linkPage) {
  try {
    const { data } = await axios.get(linkPage, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    // Ici on suppose que le lien M3U8 est dans le JS de la page
    const regex = /source:\s*"(.+\.m3u8)"/;
    const match = data.match(regex);

    return match ? match[1] : null;
  } catch (error) {
    console.error('Erreur fetchM3U8 pour', linkPage, error.message);
    return null;
  }
}

// Générer router.js
async function generateRouter() {
  const movies = await fetchMovies();
  const routerData = [];

  for (let movie of movies) {
    const m3u8 = await fetchM3U8(movie.linkPage);
    if (m3u8) {
      routerData.push({
        id: movie.title.toLowerCase().replace(/\s+/g, '_'),
        type: 'movie',
        name: movie.title,
        poster: movie.poster,
        streams: [{ url: m3u8 }]
      });
    }
  }

  const content = `export const catalogData = ${JSON.stringify(routerData, null, 2)};\n`;
  fs.writeFileSync(path.join('./api', 'router.js'), content, 'utf8');
  console.log('router.js généré avec succès avec', routerData.length, 'films');
}

// Exécuter le scraper
(async () => {
  await generateRouter();
})();
