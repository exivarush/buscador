const BASE_URL = "https://api.tibiadata.com/v4";

// Elementos do DOM
const guildForm = document.getElementById("guildForm");
const filterForm = document.getElementById("filterForm");
const membersList = document.getElementById("membersList");
const filterResults = document.getElementById("filterResults");

// Dados para o filtro
let onlineMembers = [];

// Mapeamento de vocações
const vocationMap = {
  "Royal Paladin": "RP",
  "Elder Druid": "ED",
  "Elite Knight": "EK",
  "Master Sorcerer": "MS",
};

// Buscar membros da guild
async function fetchGuildMembers(guildName) {
  try {
    const response = await fetch(`${BASE_URL}/guild/${encodeURIComponent(guildName)}`);
    if (!response.ok) throw new Error("Erro ao buscar dados da guild.");
    const data = await response.json();
    return data.guild.members || [];
  } catch (error) {
    console.error(error);
    alert("Erro ao buscar dados da guild.");
    return [];
  }
}

// Exibir membros online
function displayOnlineMembers(members) {
  membersList.innerHTML = "";

  const online = members.filter((member) => member.status === "online");
  if (online.length === 0) {
    membersList.innerHTML = "<li class='error'>Nenhum membro online encontrado.</li>";
    return;
  }

  online
    .sort((a, b) => b.level - a.level)
    .forEach((member) => {
      const li = document.createElement("li");
      const vocationAbbr = vocationMap[member.vocation] || "Unknown";

      li.className = `vocation-${vocationAbbr.toLowerCase()}`;
      li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level}, Vocação: ${vocationAbbr}`;
      membersList.appendChild(li);
    });

  onlineMembers = online; // Salvar membros online para o filtro
}

// Buscar mortes de personagens
function extractRelevantData(data) {
  if (!data || !data.character) {
    return null;
  }

  const { name, deaths } = data.character.character;
  const relevantDeaths = deaths?.map(death => ({
    time: death.time,
    reason: death.reason,
  })) || [];

  return {
    name,
    deaths: relevantDeaths,
  };
}

// Exemplo de uso
const rawData = {
  character: {
    character: {
      name: "John Doe",
    },
    deaths: [
      {
        time: "2025-01-01T12:34:56Z",
        reason: "Killed by a dragon",
      },
      {
        time: "2025-01-02T08:23:45Z",
        reason: "Killed by a demon",
      },
    ],
  },
};

const result = extractRelevantData(rawData);
console.log(result);

// Exibir resultados do filtro
async function displayFilteredResults(level, vocation) {
  filterResults.innerHTML = "";

  const filtered = onlineMembers.filter((member) => {
    const matchesLevel = level ? member.level >= level : true;
    const matchesVocation = vocation ? vocationMap[member.vocation] === vocation : true;
    return matchesLevel && matchesVocation;
  });

  if (filtered.length === 0) {
    filterResults.innerHTML = "<li class='error'>Nenhum membro encontrado com os critérios.</li>";
    return;
  }

  for (const member of filtered) {
    const li = document.createElement("li");
    const vocationAbbr = vocationMap[member.vocation] || "Unknown";

    li.innerHTML = `<strong>${member.name}</strong> - Level: ${member.level}, Vocação: ${vocationAbbr}`;
    filterResults.appendChild(li);

    const deaths = await fetchCharacterDeaths(member.name);
    if (deaths.length > 0) {
      deaths.forEach((death) => {
        const deathInfo = document.createElement("div");
        deathInfo.className = "death-info";
        deathInfo.textContent = `Morte: Level ${death.level}, Razão: ${death.reason}`;
        li.appendChild(deathInfo);
      });
    } else {
      const noDeathInfo = document.createElement("div");
      noDeathInfo.className = "death-info";
      noDeathInfo.textContent = "Nenhuma morte registrada nos últimos 30 dias.";
      li.appendChild(noDeathInfo);
    }
  }
}

// Evento de busca da guild
guildForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const guildName = document.getElementById("guildName").value.trim().toLowerCase();
  if (!guildName) {
    alert("Por favor, insira o nome da guild.");
    return;
  }
  const members = await fetchGuildMembers(guildName);
  displayOnlineMembers(members);
});

// Evento de filtro
filterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const minLevel = parseInt(document.getElementById("minLevel").value) || 0;
  const vocation = document.getElementById("vocation").value;
  await displayFilteredResults(minLevel, vocation);
});
