const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMDIzMGFkOWJlNjY3NzFkNjg5MDcwMjNmY2M1MGQ2YiIsIm5iZiI6MTc3NjM1MjE4Ny4xMjMwMDAxLCJzdWIiOiI2OWUwZmJiYjEzMTBhMjE0OWFiODAyODgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.wQk9SRcq_k3t-QRA4p0mQyrj241W9g1fE4b_6pNXvpE";
const ADSTERRA_URL = "https://www.profitablecpmratenetwork.com/vd0mz5ay5?key=74b5dbb7604fc1c7564f9954b7231af1";

// PWA Installation Variables
let deferredPrompt;
const installAppBtn = document.getElementById('installAppBtn');

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
    // 1. Show Interstitial Overlay
    const overlay = document.getElementById('interstitialOverlay');
    const countdown = document.getElementById('countdown');
    const progressBar = document.getElementById('progressBar');
    
    overlay.classList.remove('hidden');
    
    // 2. Trigger the Ad (Open Adsterra in New Tab)
    window.open(ADSTERRA_URL, '_blank');
    
    // 3. Start Countdown Timer
    let count = 5;
    countdown.textContent = count;
    progressBar.style.width = '0%';
    
    const countdownInterval = setInterval(() => {
        count--;
        countdown.textContent = count;
        progressBar.style.width = `${(5 - count) * 20}%`;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            overlay.classList.add('hidden');
            
            // 4. Fetch and Show Video in Cinema Mode
            showVideoInCinema(id);
        }
    }, 1000);
}

async function showVideoInCinema(id) {
    try {
        // Fetch Video Data from TMDB
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
        });
        const data = await response.json();
        
        // Find the Official Trailer or any YouTube Video
        const video = data.results.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || data.results[0];

        if (video && video.key) {
            const cinemaModal = document.getElementById('cinemaModal');
            const cinemaPlayer = document.getElementById('cinemaPlayer');
            
            // Show cinema modal and inject the iFrame
            cinemaModal.classList.remove('hidden');
            cinemaPlayer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0&modestbranding=1&showinfo=0" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media; fullscreen" 
                    allowfullscreen>
                </iframe>`;
        } else {
            alert("Sorry, no trailer available for this movie yet!");
        }
    } catch (error) {
        console.error("Error loading video:", error);
        alert("Error loading trailer. Please try again.");
    }
}

// Cinema Mode Event Listeners
document.getElementById('backToHome').onclick = () => {
    closeCinemaMode();
};

document.getElementById('closeCinema').onclick = () => {
    closeCinemaMode();
};

function closeCinemaMode() {
    const cinemaModal = document.getElementById('cinemaModal');
    const cinemaPlayer = document.getElementById('cinemaPlayer');
    
    cinemaModal.classList.add('hidden');
    cinemaPlayer.innerHTML = '';
}

// Legacy Video Container Event Listeners
document.getElementById('closePlayer').onclick = () => {
    document.getElementById('videoContainer').classList.add('hidden');
    document.getElementById('player').innerHTML = '';
};

// PWA Installation Logic
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show the install button
    installAppBtn.classList.remove('hidden');
});

// Handle the install button click
installAppBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    
    // Hide the install button
    installAppBtn.classList.add('hidden');
    
    console.log(`User response to the install prompt: ${outcome}`);
});

// Hide install button if app is already installed
window.addEventListener('appinstalled', () => {
    installAppBtn.classList.add('hidden');
    console.log('PWA was installed');
});

// Check if app is already in standalone mode (already installed)
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    installAppBtn.classList.add('hidden');
}

document.getElementById('searchInput').onkeypress = (e) => {
    if(e.key === 'Enter') fetchMovies(e.target.value);
};

fetchMovies();