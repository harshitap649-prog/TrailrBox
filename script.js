const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMDIzMGFkOWJlNjY3NzFkNjg5MDcwMjNmY2M1MGQ2YiIsIm5iZiI6MTc3NjM1MjE4Ny4xMjMwMDAxLCJzdWIiOiI2OWUwZmJiYjEzMTBhMjE0OWFiODAyODgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.wQk9SRcq_k3t-QRA4p0mQyrj241W9g1fE4b_6pNXvpE";
const ADSTERRA_URL = "https://www.google.com"; // Replace with your Adsterra Direct Link

async function fetchMovies(query = '') {
    const url = query 
        ? `https://api.themoviedb.org/3/search/movie?query=${query}`
        : 'https://api.themoviedb.org/3/trending/movie/day';

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });
    const data = await response.json();
    displayMovies(data.results);
}

function displayMovies(movies) {
    const grid = document.getElementById('movieGrid');
    grid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="playTrailer(${movie.id})">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <p class="text-xs mt-2 truncate font-medium">${movie.title}</p>
        </div>
    `).join('');
}

async function playTrailer(id) {
    // 1. Open Adsterra Link in New Tab
    window.open(ADSTERRA_URL, '_blank');

    // 2. Fetch Trailer from TMDB
    const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos`, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });
    const data = await response.json();
    const trailer = data.results.find(v => v.type === 'Trailer');

    if (trailer) {
        const container = document.getElementById('videoContainer');
        const player = document.getElementById('player');
        container.classList.remove('hidden');
        player.innerHTML = `<iframe class="w-full h-full" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;
        window.scrollTo(0,0);
    } else {
        alert("Trailer not found!");
    }
}

document.getElementById('closePlayer').onclick = () => {
    document.getElementById('videoContainer').classList.add('hidden');
    document.getElementById('player').innerHTML = '';
};

document.getElementById('searchInput').onkeypress = (e) => {
    if(e.key === 'Enter') fetchMovies(e.target.value);
};

fetchMovies();