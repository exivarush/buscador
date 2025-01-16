// Função para buscar informações da guild
async function buscarGuild() {
  const guildName = document.getElementById('guildName').value.toLowerCase();
  const response = await fetch(`https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`);
  const data = await response.json();

  const membrosOnline = data.guild.members
    .flatMap(group => group.online_status.filter(member => member.status === 'online'))
    .sort((a, b) => b.level - a.level);

  const guildMembers = document.getElementById('guildMembers');
  guildMembers.innerHTML = '';
  membrosOnline.forEach(member => {
    const li = document.createElement('li');
    li.style.color = getVocationColor(member.vocation);
    li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level} - ${formatVocation(member.vocation)}`;
    guildMembers.appendChild(li);
  });
}

// Função para buscar mortes dos membros online
async function buscarMortes() {
  const guildName = document.getElementById('guildName').value.toLowerCase();
  const response = await fetch(`https://api.tibiadata.com/v4/guild/${encodeURIComponent(guildName)}`);
  const data = await response.json();

  const membrosOnline = data.guild.members
    .flatMap(group => group.online_status.filter(member => member.status === 'online'));

  const mortesList = document.getElementById('mortesList');
  mortesList.innerHTML = '';

  for (const member of membrosOnline) {
    const charResponse = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(member.name)}`);
    const charData = await charResponse.json();
    const mortes = charData.character.deaths;

    mortes.forEach(morte => {
      const li = document.createElement('li');
      li.style.color = getVocationColor(member.vocation);
      li.innerHTML = `<strong>${member.name}</strong> - ${formatVocation(member.vocation)} - ${new Date(morte.time).toLocaleString()} - ${morte.reason}`;
      mortesList.appendChild(li);
    });
  }
}

// Função para buscar boosts
async function buscarBoosts() {
  const bossResponse = await fetch('https://api.tibiadata.com/v4/boostablebosses');
  const bossData = await bossResponse.json();
  document.getElementById('bossBoost').innerHTML = `<strong>${bossData.boosted_boss.name}</strong> <img src="${bossData.boosted_boss.image_url}" alt="Boss Boostado">`;

  const creatureResponse = await fetch('https://api.tibiadata.com/v4/creatures');
  const creatureData = await creatureResponse.json();
  document.getElementById('creatureBoost').innerHTML = `<strong>${creatureData.boosted_creature.name}</strong> <img src="${creatureData.boosted_creature.image_url}" alt="Criatura Boostada">`;
}

// Função para mostrar a localização do Rashid
function mostrarRashid() {
  const locations = ['Svargrond', 'Liberty Bay', 'Port Hope', 'Ankrahmun', 'Darashia', 'Edron', 'Carlin'];
  const today = new Date().getDay();
  const rashidLocation = locations[today];
  document.getElementById('rashidLocation').innerHTML = `<strong>Está em ${rashidLocation}</strong>`;
}

// Funções auxiliares
function getVocationColor(vocation) {
  switch (vocation) {
    case 'Royal Paladin': return 'orange';
    case 'Elder Druid': return 'green';
    case 'Elite Knight': return 'black';
    case 'Master Sorcerer': return 'red';
    default: return 'white';
  }
}

function formatVocation(vocation) {
  return vocation.replace('Royal Paladin', 'RP').replace('Elder Druid', 'ED').replace('Elite Knight', 'EK').replace('Master Sorcerer', 'MS');
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
  buscarBoosts();
  mostrarRashid();
});
