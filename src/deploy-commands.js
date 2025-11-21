// src/deploy-commands.js
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; 
const GUILD_ID = process.env.GUILD_ID;   

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ Defina DISCORD_TOKEN, CLIENT_ID e GUILD_ID no Railway.");
  process.exit(1);
}

const commands = [
  {
    name: "spawn",
    description: "Mostra onde um Pokémon spawna.",
    options: [
      {
        name: "pokemon",
        type: 3,
        description: "Nome ou número. Ex: bulbasaur ou 1",
        required: true
      }
    ]
  },
  {
    name: "pokedex",
    description: "Mostra informações básicas da Pokédex.",
    options: [
      {
        name: "pokemon",
        type: 3,
        description: "Nome ou número",
        required: true
      }
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🔄 Registrando comandos no servidor...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Comandos registrados com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao registrar comandos:");
    console.error(err);
  }
})();
