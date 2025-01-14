const BASE_URL = "https://api.tibiadata.com/v4";

// Elementos HTML
const guildForm = document.getElementById("guildForm");
const filterForm = document.getElementById("filterForm");
const resultList = document.getElementById("resultList");
const filterResults = document.getElementById("filterResults");

// Dados para a filtragem
let guildMembers = [];

// Função para buscar dados da guild
async function fetchGuildData(guildName) {
  try {
    const response = await fetch(`${BASE_URL}/guild/${encodeURIComponent(guildName)}`);
    if (!response.ok) throw new Error("Erro ao buscar dados da API.");
    const data = await response.json();
    return data.guild.members || [];
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao buscar dados. Tente novamente.");
    return [];
  }
}

// Função para exibir integrantes
function displayMembers(members) {
  resultList.innerHTML = "";

  if (members.length === 0) {
    resultList.innerHTML = "<li class='error'>Nenhum membro encontrado.</li>";
    return;
  }

  members.forEach((member) => {
    const li = document.createElement("li");
    let className = "";
    switch (member.vocation) {
      case "Royal Paladin":
        className = "vocation-rp";
        break;
      case "Elder Druid":
        className = "vocation-ed";
        break;
      case "Elite Knight":
        className = "vocation-ek";
        break;
      case "Master Sorcerer":
        className = "vocation-ms";
        break;
      default:
        className = "";
    }

    li.className = className;
    li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level}, Vocação: ${member.vocation}`;
    resultList.appendChild(li);
  });
}

// Função para buscar mortes
async function fetchDeaths(characterName) {
  try {
    const response = await fetch(`${BASE_URL}/character/${encodeURIComponent(characterName)}`);
    if (!response.ok) throw new Error("Erro ao buscar mortes.");
    const data = await response.json();
    const deaths = data.characters.deaths || [];
    return deaths.filter((death) => {
      const deathDate = new Date(death.time);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return deathDate >= thirtyDaysAgo;
    });
  } catch (error) {
    console.error("Erro ao buscar mortes:", error);
    return [];
  }
}

// Função para exibir resultados do filtro
async function displayFilteredResults(level, vocation) {
  filterResults.innerHTML = "";

  const filteredMembers = guildMembers.filter((member) => {
    const matchesLevel = level ? member.level >= level : true;
    const matchesVocation = vocation ? member.vocation === vocation : true;
    return matchesLevel && matchesVocation;
  });

  if (filteredMembers.length === 0) {
    filterResults.innerHTML = "<li class='error'>Nenhum membro encontrado com os critérios.</li>";
    return;
  }

  for (const member of filteredMembers) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level}, Vocação: ${member.vocation}`;
    filterResults.appendChild(li);

    const deaths = await fetchDeaths(member.name);
    if (deaths.length > 0) {
      deaths.forEach((death) => {
        const deathInfo = document.createElement("p");
        deathInfo.textContent = `Morte: Level ${death.level}, Causa: ${death.killer}`;
        li.appendChild(deathInfo);
      });
    } else {
      const noDeathInfo = document.createElement("p");
      noDeathInfo.textContent = "Nenhuma morte nos últimos 30 dias.";
      li.appendChild(noDeathInfo);
    }
  }
}

// Evento para buscar guild
guildForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const guildName = document.getElementById("guildName").value.trim();
  if (!guildName) {
    alert("Por favor, insira o nome da guild.");
    return;
  }
  guildMembers = await fetchGuildData(guildName.toLowerCase());
  displayMembers(guildMembers.sort((a, b) => b.level - a.level));
});

// Evento para filtrar membros
filterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const minLevel = parseInt(document.getElementById("minLevel").value) || 0;
  const vocation = document.getElementById("vocation").value || null;
  await displayFilteredResults(minLevel, vocation);
});
