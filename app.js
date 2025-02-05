// Configuración de la API
const API_KEY = '759faf373b08ce8bfc5fd2b4952826cb';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Elementos del DOM
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const moviesContainer = document.getElementById('moviesContainer');

// 1. Cargar películas populares al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES`);
        const data = await response.json();
        if (data.results) {
            renderMovies(data.results);
        }
    } catch (error) {
        console.error('Error al cargar películas:', error);
    }
});

// 2. Función para mostrar películas
function renderMovies(movies) {
    moviesContainer.innerHTML = movies.map(movie => `
        <div class="movie-card" data-id="${movie.id}">
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span class="rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                <p>Año: ${movie.release_date.slice(0,4)}</p>
            </div>
        </div>
    `).join('');

    // 3. Agregar eventos a las tarjetas
    addMovieClickListeners();
}

// 4. Eventos de clic en películas
function addMovieClickListeners() {
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', async () => {
            const movieId = card.dataset.id;
            const movieData = await fetchMovieDetails(movieId);
            showMovieDetails(movieData);
        });
    });
}

// 5. Obtener detalles de la película
async function fetchMovieDetails(movieId) {
    try {
        const [details, videos] = await Promise.all([
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=es-ES`),
            fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`)
        ]);
        
        const movieDetails = await details.json();
        const movieVideos = await videos.json();
        
        return {
            ...movieDetails,
            trailer: movieVideos.results.find(video => video.type === 'Trailer')
        };
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        return null;
    }
}

// 6. Mostrar modal con detalles
function showMovieDetails(movie) {
    const modal = document.createElement('div');
    modal.classList.add('modal-overlay');
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn">×</button>
            ${movie.trailer ? `
                <iframe width="560" height="315" 
                    src="https://www.youtube.com/embed/${movie.trailer.key}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            ` : ''}
            <h2>${movie.title}</h2>
            <p class="overview">${movie.overview}</p>
            <div class="details">
                <p>Duración: ${movie.runtime} min</p>
                <p>Géneros: ${movie.genres.map(g => g.name).join(', ')}</p>
                <p>Fecha de estreno: ${movie.release_date}</p>
            </div>
        </div>
    `;

    // Insertar modal en el body
    document.body.appendChild(modal);

    // Seleccionar los elementos después de insertarlos en el DOM
    const closeBtn = modal.querySelector('.close-btn');

    // Evento para cerrar el modal al hacer clic en el botón X
    closeBtn.addEventListener('click', () => {
        console.log("Cerrando modal..."); // Verifica si se ejecuta
        modal.remove();
    });

}


// 7. Función de búsqueda (manteniendo películas existentes)
async function searchMovies() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        alert('Ingresa un término de búsqueda');
        return;
    }
    
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}&language=es-ES`
        );
        const data = await response.json();
        renderMovies(data.results);
    } catch (error) {
        console.error('Error en búsqueda:', error);
    }
}

// Eventos
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMovies();
});