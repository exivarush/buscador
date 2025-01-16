async function consultarGuild() {
    const guildName = document.getElementById('guildName').value.toLowerCase();
    const response = await fetch(`https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`);
    const data = await response.json();
    const membros = data.guild.members;
    const onlineMembros = membros.filter(membro => membro.status === 'online').sort((a, b) => b.level - a.level);

    document.getElementById('totalOnline').innerText = onlineMembros.length;
    const listaOnline = document.getElementById('listaOnline');
    listaOnline.innerHTML = '';

    onlineMembros.forEach(membro => {
        const li = document.createElement('li');
        li.className = membro.vocation.replace(' ', '');
        li.innerHTML = `${membro.name} - Level ${membro.level} - ${membro.vocation.replace('Royal Paladin', 'RP').replace('Elder Druid', 'ED').replace('Elite Knight', 'EK').replace('Master Sorcerer', 'MS')}`;
        listaOnline.appendChild(li);
    });

    document.getElementById('popup').style.display = 'block';
    setTimeout(consultarGuild, 180000); // Atualiza a cada 3 minutos
}

async function consultarMortes() {
    const guildName = document.getElementById('guildName').value.toLowerCase();
    const response = await fetch(`https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`);
    const data = await response.json();
    const membros = data.guild.members;
    const onlineMembros = membros.filter(membro => membro.status === 'online');

    const resultados = document.getElementById('resultados');
    resultados.innerHTML = '';

    for (const membro of onlineMembros) {
        const response = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(membro.name)}`);
        const data = await response.json();
        const mortesPersonagem = data.character.deaths;

        mortesPersonagem.forEach(morte => {
            const div = document.createElement('div');
            div.className = membro.vocation.replace(' ', '');
            div.innerHTML = `${membro.name} - Level ${morte.level} - ${membro.vocation.replace('Royal Paladin', 'RP').replace('Elder Druid', 'ED').replace('Elite Knight', 'EK').replace('Master Sorcerer', 'MS')} - ${new Date(morte.time).toLocaleString()} - ${morte.reason}`;
            resultados.appendChild(div);
        });
    }
}

async function consultarBoostados() {
    const bossResponse = await fetch('https://api.tibiadata.com/v4/boostablebosses');
    const bossData = await bossResponse.json();
    const criaturaResponse = await fetch('https://api.tibiadata.com/v4/creatures');
    const criaturaData = await criaturaResponse.json();

    const bossBoostado = document.getElementById('bossBoostado');
    bossBoostado.innerHTML = `<strong>Boss Boostado:</strong> ${bossData.boostable_bosses.current.name} <img src="${bossData.boostable_bosses.current.image_url}" alt="${bossData.boostable_bosses.current.name}">`;

    const criaturaBoostada = document.getElementById('criaturaBoostada');
    criaturaBoostada.innerHTML = `<strong>Criatura Boostada:</strong> ${criaturaData.creatures.boosted.name} <img src="${criaturaData.creatures.boosted.image_url}" alt="${criaturaData.creatures.boosted.name}">`;
}

function consultarRashid() {
    const rashid = document.getElementById('rashid');
    const dias = ['Svargrond', 'Liberty Bay', 'Port Hope', 'Ankrahmun', 'Darashia', 'Edron', 'Carlin'];
    const hoje =