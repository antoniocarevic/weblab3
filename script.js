let filmovi = [];

function fetchMovies(){
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
    prikaziTablicu(filmovi.slice(0, 150));
});

}

fetchMovies()


function prikaziTablicu(filmovi) {
    const tbody = document.querySelector('#filmovi-tablica tbody');
    tbody.innerHTML = ''; // ocisti ako postoji
    for (const film of filmovi) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${film.title}</td>
            <td>${film.year}</td>
            <td>${film.genre}</td>
            <td>${film.duration}</td>
            <td>${film.country}</td>
            <td>${film.total_votes}</td>
        `;
    tbody.appendChild(row);
    }
}

const prvih20 = filmovi.slice(0, 150);
prikaziTablicu(prvih20);

function filtriraj() {
    const zanr = document.getElementById('filter-genre').
    value.trim().toLowerCase();
    const godinaOd = parseInt(document.getElementById(`
    filter-year-from`).value);
    const drzava = document.getElementById('filter-country')
    .value.trim().toLowerCase();
    const ocjena = parseFloat(document.getElementById(`
    filter-rating`).value);
    const filtriraniFilmovi = sviFilmovi.filter(film => {
    const zanrMatch = !zanr || film.genre.toLowerCase
    ().includes(zanr);
    const godinaOdMatch = !godinaOd || film.year >=
    godinaOd;
    const drzavaMatch = !drzava || film.country.some(c=> c.toLowerCase().includes(drzava));
    const ocjenaMatch = film.avg_vote >= ocjena;
    return zanrMatch && godinaOdMatch && drzavaMatch
        && ocjenaMatch;
    });
    prikaziFiltriraneFilmove(filtriraniFilmovi);
}

function prikaziFiltriraneFilmove(filmovi) {
    const tbody = document.querySelector(`#
    filtriranje_tablica tbody`);
    tbody.innerHTML = '';
    if (filmovi.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">Nema
    filmova za odabrane filtre.</td></tr>`;
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
    <td>${film.avg_vote}</td>
    `;
    tbody.appendChild(row);
    }
}

document.getElementById('primijeni-filtere').addEventListener(
    'click', filtriraj);
