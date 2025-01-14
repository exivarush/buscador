const BASE_URL = "https://api.tibiadata.com/v4";

// Elementos HTML
const guildForm = document.getElementById("guildForm");
const filterForm = document.getElementById("filterForm");
const resultList = document.getElementById("resultList");
const filterResults = document.getElementById("filterResults");

// Dados para a filtragem
let onlineMembers = [];

// Mapear vocações para abreviações
const vocationMap = {
  "Royal Paladin": "RP",
  "Elder Druid": "ED",
  "Elite Knight": "EK",
  "Master Sorcerer": "MS",
};

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

// Função para exibir membros online
function displayOnlineMembers(members) {
  resultList.innerHTML = "";

  const onlineMembersFiltered = members.filter((member) => member.status === "online");
  if (onlineMembersFiltered.length === 0) {
    resultList.innerHTML = "<li class='error'>Nenhum membro online encontrado.</li>";
    return;
  }

  onlineMembersFiltered.sort((a, b) => b.level - a.level).forEach((member) => {
    const li = document.createElement("li");
    const vocationAbbreviation = vocationMap[member.vocation] || "Unknown";

    let className = "";
    switch (vocationAbbreviation) {
      case "RP":
        className = "vocation-rp";
        break;
      case "ED":
        className = "vocation-ed";
        break;
      case "EK":
        className = "vocation-ek";
        break;
      case "MS":
        className = "vocation-ms";
        break;
    }

    li.className = className;
    li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level}, Vocação: ${vocationAbbreviation}`;
    resultList.appendChild(li);
  });

  // Armazena os membros online para filtragem posterior
  onlineMembers = onlineMembersFiltered;
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
      return deathDate >= thirtyDaysAgo && death.reason;
    });
  } catch (error) {
    console.error("Erro ao buscar mortes:", error);
    return [];
  }
}

// Função para exibir resultados do filtro
async function displayFilteredResults(level, vocation) {
  filterResults.innerHTML = "";

  const filteredMembers = onlineMembers.filter((member) => {
    const matchesLevel = level ? member.level >= level : true;
    const matchesVocation = vocation ? vocationMap[member.vocation] === vocation : true;
    return matchesLevel && matchesVocation;
  });

  if (filteredMembers.length === 0) {
    filterResults.innerHTML = "<li class='error'>Nenhum membro encontrado com os critérios.</li>";
    return;
  }

  for (const member of filteredMembers) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level}, Vocação: ${vocationMap[member.vocation]}`;
    filterResults.appendChild(li);

    const deaths = await fetchDeaths(member.name);
    if (deaths.length > 0) {
      deaths.forEach((death) => {
        const deathInfo = document.createElement("p");
        deathInfo.textContent = `Morte: Level ${death.level}, Causa: ${death.reason}`;
        li.appendChild(deathInfo);
      });
    } else {
      const noDeathInfo = document.createElement("p");
      noDeathInfo.textContent = "Nenhuma morte registrada nos últimos 30 dias.";
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
  const members = await fetchGuildData(guildName.toLowerCase());
  displayOnlineMembers(members);
});

// Evento para filtrar membros
filterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const minLevel = parseInt(document.getElementById("minLevel").value) || 0;
  const vocation = document.getElementById("vocation").value || null;
  await displayFilteredResults(minLevel, vocation);
});
