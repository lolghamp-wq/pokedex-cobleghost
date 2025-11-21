// src/lib/spawnLoader.js
const fs = require('fs-extra');

function extractId(entity_type) {
  if (!entity_type) return null;
  return entity_type.split(":")[1];
}

function normalizeBiome(filter) {
  if (!filter) return [];
  if (Array.isArray(filter)) return filter;

  const result = [];

  if (filter.test === "has_biome_tag" && filter.value) {
    result.push(filter.value);
  }

  if (Array.isArray(filter.any_of)) {
    filter.any_of.forEach(entry => entry.value && result.push(entry.value));
  }

  if (Array.isArray(filter.all_of)) {
    filter.all_of.forEach(entry => entry.value && result.push(entry.value));
  }

  return result;
}

async function load(filePath) {
  const raw = await fs.readJson(filePath);

  const conditions =
    raw["minecraft:spawn_rules"]?.conditions ||
    raw.conditions ||
    [];

  const byId = {};
  const index = [];

  for (const c of conditions) {
    const permute = c["minecraft:permute_type"] || c.permute_type || [];
    const blocks = c["minecraft:spawns_on_block_filter"] || [];
    const biomeFilter = c["minecraft:biome_filter"];
    const biomes = normalizeBiome(biomeFilter);

    const delay = c["minecraft:delay_filter"] || {};
    const spawn_chance = delay.spawn_chance;

    for (const entry of permute) {
      const entityType = entry.entity_type;
      const id = extractId(entityType);
      if (!id) continue;

      const number = parseInt(id.replace("p", ""), 10);

      if (!byId[id]) {
        byId[id] = {
          id,
          number,
          biomes: new Set(),
          blocks: new Set(),
          spawn_chance,
          group: new Set(),
          height: c["minecraft:height_filter"]
            ? JSON.stringify(c["minecraft:height_filter"])
            : "—"
        };
        index.push(byId[id]);
      }

      biomes.forEach(b => byId[id].biomes.add(b));
      blocks.forEach(b => byId[id].blocks.add(b));

      if (permute.length > 1) {
        for (const other of permute) {
          const otherId = extractId(other.entity_type);
          if (otherId && otherId !== id) {
            byId[id].group.add(otherId);
          }
        }
      }
    }
  }

  for (const key in byId) {
    byId[key].biomes = Array.from(byId[key].biomes);
    byId[key].blocks = Array.from(byId[key].blocks);
    byId[key].group = Array.from(byId[key].group);
  }

  return { byId, index };
}

function findByNameOrNumber(spawnData, query) {
  const q = query.toLowerCase();

  let id = q.startsWith("p") ? q : `p${q}`;
  if (spawnData.byId[id]) return spawnData.byId[id];

  const num = parseInt(q, 10);
  if (!isNaN(num)) {
    id = `p${num}`;
    if (spawnData.byId[id]) return spawnData.byId[id];
  }

  return null;
}

function findPokedexEntry(spawnData, query) {
  const found = findByNameOrNumber(spawnData, query);
  if (found) return found;

  return null;
}

module.exports = { load, findByNameOrNumber, findPokedexEntry };
