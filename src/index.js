// src/index.js
const { Client, GatewayIntentBits, Partials, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

// Variáveis de ambiente (Railway)
const TOKEN = process.env.DISCORD_TOKEN;
const SPAWN_RULES_PATH = process.env.SPAWN_RULES_PATH || 'data/spawn_rules.json';
const POKEDEX_PATH = 'data/pokedex.json';
const SPRITES_DIR = 'data/sprites';

if (!TOKEN) {
  console.error('❌ ERRO: defina a variável DISCORD_TOKEN no Railway.');
  process.exit(1);
}

const spawnLoader = require('./lib/spawnLoader');

async function startBot() {
  console.log("🔄 Carregando spawn rules...");
  const spawnData = await spawnLoader.load(SPAWN_RULES_PATH);

  console.log("🔄 Carregando pokedex...");
  let pokedex = {};
  if (await fs.pathExists(POKEDEX_PATH)) {
    pokedex = await fs.readJson(POKEDEX_PATH);
  } else {
    console.warn("⚠ pokedex.json não encontrado.");
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    partials: [Partials.Channel]
  });

  client.once("ready", () => {
    console.log(`✅ Bot online: ${client.user.tag}`);
  });

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.commandName;

    if (command === "spawn") {
      const query = interaction.options.getString("pokemon", true);
      await interaction.deferReply();

      const result = spawnLoader.findByNameOrNumber(spawnData, query);
      if (!result) return interaction.editReply(`❌ Pokémon **${query}** não encontrado nos spawn rules.`);

      const pok = pokedex[result.id] || { name: result.id, number: result.number, types: ["Unknown"] };

      const embed = new EmbedBuilder()
        .setTitle(`${pok.name} — #${pok.number}`)
        .addFields(
          { name: "Biomas", value: result.biomes.join(", ") || "Nenhum", inline: true },
          { name: "Blocos", value: result.blocks.join(", ") || "Nenhum", inline: true },
          { name: "Chance", value: String(result.spawn_chance || "—"), inline: true },
          { name: "Altura", value: result.height || "—", inline: true },
          { name: "Grupo de spawn",
