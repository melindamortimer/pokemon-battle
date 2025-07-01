async function fetchPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();

    let statsDetail = {};
    let totalStats = 0;

    data.stats.forEach(statObj => {
        const statName = capitalize(statObj.stat.name);
        const statValue = statObj.base_stat;
        statsDetail[statName] = statValue;
        totalStats += statValue;
    });

    return {
        name: capitalize(data.name),
        stats: statsDetail,
        totalStats: totalStats,
        sprite: data.sprites.front_default,
        cry: data.cries?.legacy || data.cries?.latest
    };
}


async function addPokemon(teamId) {
    const teamGrid = document.getElementById(`${teamId}-grid`);
    const teamScore = document.getElementById(`${teamId}-score`);
    const teamButton = document.getElementById(`${teamId}-btn`);

    if (teamGrid.children.length >= 6) {
        return;
    }

    const id = Math.floor(Math.random() * 251) + 1;
    const pokemon = await fetchPokemon(id);

    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    const img = document.createElement('img');
    img.src = pokemon.sprite;
    img.alt = pokemon.name;
    img.classList.add('pokemon-sprite');

    img.addEventListener('click', () => {
        if (pokemon.cry) {
            let audio = new Audio(pokemon.cry);
            audio.play();
        }
    });

    const nameElement = document.createElement('div');
    nameElement.classList.add('pokemon-name');
    nameElement.textContent = pokemon.name;

    const statsTable = document.createElement('table');
    statsTable.classList.add('pokemon-stats');

    Object.entries(pokemon.stats).forEach(([stat, value]) => {
        const row = document.createElement('tr');
        const statNameCell = document.createElement('td');
        statNameCell.textContent = stat;
        const statValueCell = document.createElement('td');
        statValueCell.textContent = value;
        row.appendChild(statNameCell);
        row.appendChild(statValueCell);
        statsTable.appendChild(row);
    });

    card.appendChild(img);
    card.appendChild(nameElement);
    card.appendChild(statsTable);
    teamGrid.appendChild(card);

    teamScore.textContent = parseInt(teamScore.textContent) + pokemon.totalStats;

    if (teamGrid.children.length >= 6) {
        teamButton.disabled = true;
    }

    // Check if both teams are full and determine winner
    checkForWinner();
}

function checkForWinner() {
    const team1Full = document.getElementById("team1-grid").children.length === 6;
    const team2Full = document.getElementById("team2-grid").children.length === 6;

    if (team1Full && team2Full) {
        setTimeout(determineWinner, 250);  // Delay before announcing the winner
    }
}

async function determineWinner() {
    const team1Score = parseInt(document.getElementById("team1-score").textContent);
    const team2Score = parseInt(document.getElementById("team2-score").textContent);
    
    const team1 = document.getElementById("team1");
    const team2 = document.getElementById("team2");

    const team1Text = document.querySelector("#team1 .winner-text");
    const team2Text = document.querySelector("#team2 .winner-text");

    team1.classList.remove("winner");
    team2.classList.remove("winner");
    team1Text.textContent = "";
    team2Text.textContent = "";

    await new Promise(resolve => setTimeout(resolve, 1500)); // Delay before announcement

    if (team1Score > team2Score) {
        team1.classList.add("winner");
        team1Text.textContent = "Winner!";
    } else if (team2Score > team1Score) {
        team2.classList.add("winner");
        team2Text.textContent = "Winner!";
    } else {
        alert("It's a tie!");
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}



let allPokemonNames = [];

async function loadAllPokemonNames() {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
    const data = await res.json();
    allPokemonNames = data.results.map(p => capitalize(p.name));
}
loadAllPokemonNames();

document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll(".poke-input");
    inputs.forEach(input => setupAutocomplete(input));
});

function setupAutocomplete(input) {
    const wrapper = input.parentElement;
    const list = wrapper.querySelector(".suggestions");
    let currentIndex = -1;

    input.addEventListener("input", () => {
        const val = input.value.toLowerCase();
        list.innerHTML = "";
        currentIndex = -1;
        if (!val) return;

        const matches = allPokemonNames.filter(name => name.toLowerCase().startsWith(val)).slice(0, 6);
        matches.forEach(name => {
            const li = document.createElement("li");
            li.textContent = name;
            li.addEventListener("click", () => {
                input.value = name;
                list.innerHTML = "";
                handleManualAdd(input, name);
            });
            list.appendChild(li);
        });
    });

    input.addEventListener("keydown", (e) => {
        const items = list.querySelectorAll("li");
        if (e.key === "ArrowDown") {
            currentIndex = (currentIndex + 1) % items.length;
        } else if (e.key === "ArrowUp") {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
        } else if (e.key === "Enter") {
            e.preventDefault();
            let selectedItem;
    
            if (currentIndex >= 0 && currentIndex < items.length) {
                selectedItem = items[currentIndex];
            } else if (items.length > 0) {
                selectedItem = items[0];
            }
    
            if (selectedItem) {
                const selectedName = selectedItem.textContent;
                input.value = "";
                list.innerHTML = "";
                currentIndex = -1;
                handleManualAdd(input, selectedName);
            }
        }

        items.forEach((item, idx) => {
            item.classList.toggle("highlighted", idx === currentIndex);
        });
    });
}

async function handleManualAdd(input, name) {
    const teamId = input.closest(".team").id;
    const teamGrid = document.getElementById(`${teamId}-grid`);
    const teamScore = document.getElementById(`${teamId}-score`);
    const teamButton = document.getElementById(`${teamId}-btn`);

    if (teamGrid.children.length >= 6) return;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        const data = await response.json();

        const statsDetail = {};
        let totalStats = 0;

        data.stats.forEach(statObj => {
            const statName = capitalize(statObj.stat.name.replace("-", " "));
            const statValue = statObj.base_stat;
            statsDetail[statName] = statValue;
            totalStats += statValue;
        });

        const pokemon = {
            name: capitalize(data.name),
            stats: statsDetail,
            totalStats,
            sprite: data.sprites.front_default,
            cry: data.cries?.legacy || data.cries?.latest
        };

        const card = document.createElement("div");
        card.classList.add("pokemon-card");

        const img = document.createElement("img");
        img.src = pokemon.sprite;
        img.alt = pokemon.name;
        img.classList.add("pokemon-sprite");

        img.addEventListener("click", () => {
            if (pokemon.cry) {
                new Audio(pokemon.cry).play();
            }
        });

        const nameElement = document.createElement("div");
        nameElement.classList.add("pokemon-name");
        nameElement.textContent = pokemon.name;

        const statsTable = document.createElement("table");
        statsTable.classList.add("pokemon-stats");
        Object.entries(pokemon.stats).forEach(([stat, value]) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${stat}</td><td>${value}</td>`;
            statsTable.appendChild(row);
        });

        card.appendChild(img);
        card.appendChild(nameElement);
        card.appendChild(statsTable);
        teamGrid.appendChild(card);

        teamScore.textContent = parseInt(teamScore.textContent) + pokemon.totalStats;

        if (teamGrid.children.length >= 6) {
            teamButton.disabled = true;
        }
        input.value = ""; // ✅ Clear input after selection

        checkForWinner();
    } catch (err) {
        alert("Invalid Pokémon name.");
    }
}
