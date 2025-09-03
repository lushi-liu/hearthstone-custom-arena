"use client";
import { useState, useEffect } from "react";

export default function BuildDeck() {
  const [cards, setCards] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [deckName, setDeckName] = useState("");
  const [deckClass, setDeckClass] = useState("Neutral");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/cards")
      .then((res) => res.json())
      .then((data) => setCards(data));
  }, []);

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 30) {
      setSelected([...selected, id]);
    } else {
      setError("Cannot select more than 30 cards");
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (!deckName) {
      setError("Deck name is required");
      return;
    }
    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: deckName,
          class: deckClass,
          cards: selected,
        }),
      });
      if (!response.ok) throw new Error("Failed to save deck");
      setSuccess("Deck saved successfully!");
      setDeckName("");
      setDeckClass("Neutral");
      setSelected([]);
    } catch (err) {
      setError("Error saving deck. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Draft Deck</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div className="mb-4">
        <label className="block">Deck Name</label>
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block">Class</label>
        <select
          value={deckClass}
          onChange={(e) => setDeckClass(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="Neutral">Neutral</option>
          <option value="Mage">Mage</option>
          <option value="Shaman">Shaman</option>
          <option value="Warrior">Warrior</option>
          <option value="Druid">Druid</option>
          <option value="Hunter">Hunter</option>
          <option value="Paladin">Paladin</option>
          <option value="Priest">Priest</option>
          <option value="Rogue">Rogue</option>
          <option value="Warlock">Warlock</option>
        </select>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-4">
        {cards.map((card) => (
          <div
            key={card._id}
            onClick={() => toggleSelect(card._id)}
            className={`border p-2 cursor-pointer ${
              selected.includes(card._id) ? "bg-blue-200" : ""
            }`}
          >
            <img
              src={card.imageUrl || "/placeholder.png"}
              alt={card.name}
              className="w-full h-32 object-contain"
            />
            <p>
              {card.name} ({card.mana} Mana)
            </p>
            <p>
              {card.type} - {card.class}
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        Save Deck ({selected.length}/30)
      </button>
    </div>
  );
}
