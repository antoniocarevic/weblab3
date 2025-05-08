let filmovi = [];
let prvih20 = [];
let kosarica = JSON.parse(localStorage.getItem('kosarica')) || [];

function fetchMovies() {
    fetch('filmtv_movies.csv')
        .then(res => res.text())
        .then(csv => {
            const rezultat = Papa.parse(csv, {
                header: true,
                skipEmptyLines: true
            });
            filmovi = rezultat.data.map(film => ({
                title: film.title,
                year: Number(film.year),
                genre: film.genre,
                duration: Number(film.duration),
                country: film.country?.split(',').map(c => c.trim()) || [],
                total_votes: Number(film.total_votes)
            }));
            prvih20 = filmovi.slice(0, 150);
            prikaziTablicu(prvih20);
            azurirajBrojUKosarici();
        })
        .catch(error => console.error('Error fetching movies:', error));
}

function prikaziTablicu(filmovi) {
    const tbody = document.querySelector('#filmovi-tablica tbody');
    tbody.innerHTML = ''; // Clear table body
    if (!filmovi || filmovi.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">Nema filmova za prikaz.</td></tr>`;
        return;
    }
    for (const film of filmovi) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${film.title}</td>
            <td>${film.year}</td>
            <td>${film.genre}</td>
            <td>${film.duration} min</td>
            <td>${film.country.join(', ')}</td>
            <td>${film.total_votes}</td>
            <td><button class="dodaj-u-kosaricu" data-title="${film.title}">+</button></td>
        `;
        tbody.appendChild(row);
    }
    // Add event listeners for "Dodaj u košaricu" buttons
    document.querySelectorAll('.dodaj-u-kosaricu').forEach(button => {
        button.addEventListener('click', () => {
            const title = button.getAttribute('data-title');
            const film = filmovi.find(f => f.title === title);
            if (!kosarica.some(f => f.title === title)) {
                kosarica.push({ title: film.title, year: film.year, genre: film.genre });
                localStorage.setItem('kosarica', JSON.stringify(kosarica));
                azurirajBrojUKosarici();
                alert(`Film "${title}" dodan u košaricu.`);
            }
        });
    });
}

function filtriraj() {
    const zanr = document.getElementById('filter-genre').value.trim().toLowerCase();
    const godinaOd = parseInt(document.getElementById('filter-year-from').value) || 0;
    const drzava = document.getElementById('filter-country').value.trim().toLowerCase();
    const maxDuration = parseInt(document.getElementById('filter-duration').value);

    const filtriraniFilmovi = prvih20.filter(film => {
        const zanrMatch = !zanr || film.genre.toLowerCase().includes(zanr);
        const godinaOdMatch = !godinaOd || film.year >= godinaOd;
        const drzavaMatch = !drzava || film.country.some(c => c.toLowerCase().includes(drzava));
        const trajanjeMatch = film.duration <= maxDuration;
        return zanrMatch && godinaOdMatch && drzavaMatch && trajanjeMatch;
    });

    prikaziTablicu(filtriraniFilmovi);
}

function resetirajFiltere() {
    document.getElementById('filter-genre').value = '';
    document.getElementById('filter-year-from').value = '';
    document.getElementById('filter-country').value = '';
    document.getElementById('filter-duration').value = '200';
    document.getElementById('duration-value').textContent = '200';
    
    prikaziTablicu(prvih20);
}

function azurirajBrojUKosarici() {
    const broj = document.getElementById('broj-u-kosarici');
    if (broj) broj.textContent = kosarica.length;
}

function prikaziKosaricu() {
    const modal = document.getElementById('cart-modal');
    const cartList = document.getElementById('cart-list');
    cartList.innerHTML = ''; // Clear cart list
    if (kosarica.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Košarica je prazna.';
        cartList.appendChild(li);
    } else {
        kosarica.forEach(film => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${film.title}
                <button class="ukloni-iz-kosarice" data-title="${film.title}">−</button>
            `;
            cartList.appendChild(li);
        });
    }
    modal.style.display = 'block';
    // Add event listeners for "Ukloni" buttons
    document.querySelectorAll('.ukloni-iz-kosarice').forEach(button => {
        button.addEventListener('click', () => {
            const title = button.getAttribute('data-title');
            kosarica = kosarica.filter(f => f.title !== title);
            localStorage.setItem('kosarica', JSON.stringify(kosarica));
            azurirajBrojUKosarici();
            prikaziKosaricu(); // Refresh cart modal
        });
    });
}

// Event listeners
document.getElementById('filter-duration').addEventListener('input', function() {
    document.getElementById('duration-value').textContent = this.value;
});

document.getElementById('primijeni-filtere').addEventListener('click', filtriraj);
document.getElementById('reset-filtere').addEventListener('click', resetirajFiltere);
document.getElementById('pogledaj-kosaricu').addEventListener('click', prikaziKosaricu);
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('cart-modal').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    azurirajBrojUKosarici();
    fetchMovies();
});