const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMDIzMGFkOWJlNjY3NzFkNjg5MDcwMjNmY2M1MGQ2YiIsIm5iZiI6MTc3NjM1MjE4Ny4xMjMwMDAxLCJzdWIiOiI2OWUwZmJiYjEzMTBhMjE0OWFiODAyODgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.wQk9SRcq_k3t-QRA4p0mQyrj241W9g1fE4b_6pNXvpE";
const ADSTERRA_URL = "https://www.profitablecpmratenetwork.com/e09vd63e2?key=aaed340d748709ed33b85743a2ea6b70";

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
    // 1. Trigger the Ad (Open Adsterra in New Tab)
    window.open(ADSTERRA_URL, '_blank');

    try {
        // 2. Fetch Video Data from TMDB
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        const data = await response.json();
        
        // 3. Find the Official Trailer or any YouTube Video
        const video = data.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || data.results[0];

        if (video && video.key) {
            const container = document.getElementById('videoContainer');
            const player = document.getElementById('player');
            
            // Show the container and inject the iFrame
            container.classList.remove('hidden');
            player.innerHTML = `
                <iframe 
                    class="w-full h-full" 
                    src="https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
                </iframe>`;
            
            // Scroll to top so user sees the video
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert("Sorry, no trailer available for this movie yet!");
        }
    } catch (error) {
        console.error("Error loading video:", error);
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