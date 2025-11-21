// src/commands/pokedex.js
module.exports = {
  name: "pokedex",
  description: "Mostra informações básicas de Pokédex.",
  options: [
    {
      name: "pokemon",
      type: 3,
      description: "Nome ou número. Ex: bulbasaur ou 1",
      required: true
    }
  ]
};
