async function fetchPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();

    let statsDetail = {};
    let totalStats = 0;

    data.stats.forEach(statObj => {
        const statName = statObj.stat.name;
        const statValue = statObj.base_stat;
        statsDetail[statName] = statValue;
        totalStats += statValue;
    });

    return {
        name: data.name,
        stats: statsDetail,
        totalStats: totalStats,
        sprite: data.sprites.front_default,
        cry: data.cries?.legacy || data.cries?.latest
    };
}

async function addPokemon(teamId) {
    const teamList = document.getElementById(`${teamId}-list`);
    const teamScore = document.getElementById(`${teamId}-score`);
    
    if (teamList.children.length >= 6) {
        alert("Each team can have only 6 Pokémon!");
        return;
    }

    const id = Math.floor(Math.random() * 898) + 1;
    const pokemon = await fetchPokemon(id);

    const listItem = document.createElement('li');
    listItem.classList.add('pokemon-card');

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

    const textContent = document.createElement('div');
    textContent.innerHTML = `<strong>${pokemon.name}</strong>`;
    
    const statsGrid = document.createElement('div');
    statsGrid.classList.add('pokemon-stats');
    Object.entries(pokemon.stats).forEach(([stat, value]) => {
        const statItem = document.createElement('div');
        statItem.textContent = `${stat}: ${value}`;
        statsGrid.appendChild(statItem);
    });

    textContent.appendChild(statsGrid);
    listItem.appendChild(img);
    listItem.appendChild(textContent);
    teamList.appendChild(listItem);

    teamScore.textContent = parseInt(teamScore.textContent) + pokemon.totalStats;
}

async function determineWinner() {
    const team1Score = parseInt(document.getElementById("team1-score").textContent);
    const team2Score = parseInt(document.getElementById("team2-score").textContent);
    
    const team1 = document.getElementById("team1");
    const team2 = document.getElementById("team2");
    
    team1.classList.remove("winner");
    team2.classList.remove("winner");

    await new Promise(resolve => setTimeout(resolve, 1500)); // Delay before announcement

    if (team1Score > team2Score) {
        team1.classList.add("winner");
    } else if (team2Score > team1Score) {
        team2.classList.add("winner");
    } else {
        alert("It's a tie!");
    }
}
