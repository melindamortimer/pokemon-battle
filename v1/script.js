async function fetchPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    
    // Extract Pokémon stats
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
        sprite: data.sprites.front_default,  // Get front image
        cry: data.cries?.legacy  // Get Pokémon cry sound
    };
}

async function generateTeam(teamListId, teamScoreId) {
    const teamList = document.getElementById(teamListId);
    const teamScore = document.getElementById(teamScoreId);
    teamList.innerHTML = '';

    let totalStats = 0;
    let pokemonIds = new Set();

    while (pokemonIds.size < 6) {
        pokemonIds.add(Math.floor(Math.random() * 898) + 1);
    }

    for (let id of pokemonIds) {
        const pokemon = await fetchPokemon(id);
        
        // Create list item
        const listItem = document.createElement('li');

        // Create image element
        const img = document.createElement('img');
        img.src = pokemon.sprite;
        img.alt = pokemon.name;
        img.classList.add('pokemon-sprite');

        // Play cry on click
        img.addEventListener('click', () => {
            if (pokemon.cry) {
                let audio = new Audio(pokemon.cry);
                audio.play();
            }
        });

        // Create text content
        const textContent = document.createElement('div');
        textContent.innerHTML = `<strong>${pokemon.name}</strong> (Total: ${pokemon.totalStats})<br>` +
            Object.entries(pokemon.stats)
                .map(([stat, value]) => `${stat}: ${value}`)
                .join(', ');

        // Append elements
        listItem.appendChild(img);
        listItem.appendChild(textContent);
        teamList.appendChild(listItem);

        totalStats += pokemon.totalStats;
    }

    teamScore.textContent = totalStats;
    return totalStats;
}


async function generateTeams() {
    const team1 = document.getElementById("team1");
    const team2 = document.getElementById("team2");
    
    team1.classList.remove("winner");
    team2.classList.remove("winner");

    const team1Score = await generateTeam("team1-list", "team1-score");
    const team2Score = await generateTeam("team2-list", "team2-score");

    if (team1Score > team2Score) {
        team1.classList.add("winner");
    } else if (team2Score > team1Score) {
        team2.classList.add("winner");
    }
}