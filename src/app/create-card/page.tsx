"use client";
import { useState } from "react";

export default function CreateCard() {
  const [form, setForm] = useState({
    name: "",
    type: "MINION",
    class: "NEUTRAL",
    mana: 0,
    attack: 0,
    health: 0,
    rarity: "Common",
    description: "",
    tribe: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Failed to create card");
      setSuccess("Card created successfully!");
      setForm({
        name: "",
        type: "MINION",
        class: "NEUTRAL",
        mana: 0,
        attack: 0,
        health: 0,
        rarity: "Common",
        description: "",
        tribe: "",
      });
    } catch (err) {
      setError("Error creating card. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Hearthstone Card</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full p-2 border rounded bg-black"
          >
            <option value="MINION">Minion</option>
            <option value="SPELL">Spell</option>
            <option value="WEAPON">Weapon</option>
          </select>
        </div>
        <div>
          <label className="block">Mana</label>
          <input
            type="number"
            value={form.mana}
            onChange={(e) => setForm({ ...form, mana: +e.target.value })}
            className="w-full p-2 border rounded"
            min="0"
            required
          />
        </div>
        {form.type === "MINION" && (
          <>
            <div>
              <label className="block">Attack</label>
              <input
                type="number"
                value={form.attack}
                onChange={(e) => setForm({ ...form, attack: +e.target.value })}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block">Health</label>
              <input
                type="number"
                value={form.health}
                onChange={(e) => setForm({ ...form, health: +e.target.value })}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block">Tribe</label>
              <input
                type="text"
                value={form.tribe}
                onChange={(e) => setForm({ ...form, tribe: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="e.g., Murloc, Demon"
              />
            </div>
          </>
        )}
        {form.type === "WEAPON" && (
          <>
            <div>
              <label className="block">Attack</label>
              <input
                type="number"
                value={form.attack}
                onChange={(e) => setForm({ ...form, attack: +e.target.value })}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block">Health</label>
              <input
                type="number"
                value={form.health}
                onChange={(e) => setForm({ ...form, health: +e.target.value })}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
          </>
        )}
        <div>
          <label className="block">Rarity</label>
          <select
            value={form.rarity}
            onChange={(e) => setForm({ ...form, rarity: e.target.value })}
            className="w-full p-2 border rounded bg-black"
          >
            <option value="Common">Common</option>
            <option value="Rare">Rare</option>
            <option value="Epic">Epic</option>
            <option value="Legendary">Legendary</option>
          </select>
        </div>
        <div>
          <label className="block">Class</label>
          <select
            value={form.class}
            onChange={(e) => setForm({ ...form, class: e.target.value })}
            className="w-full p-2 border rounded bg-black"
          >
            <option value="NEUTRAL">Neutral</option>
            <option value="MAGE">Mage</option>
            <option value="SHAMAN">Shaman</option>
            <option value="DRUID">Druid</option>
            <option value="DRUID">Paladin</option>
            <option value="DRUID">Warrior</option>
            <option value="DRUID">Hunter</option>
            <option value="DRUID">Priest</option>
            <option value="DRUID">Rogue</option>
            <option value="DRUID">Warlock</option>
          </select>
        </div>
        <div>
          <label className="block">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 hover:bg-blue-800 text-white rounded"
        >
          Create Card
        </button>
      </form>
    </div>
  );
}
