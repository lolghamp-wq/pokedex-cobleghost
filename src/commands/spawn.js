// src/commands/spawn.js
module.exports = {
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
};
