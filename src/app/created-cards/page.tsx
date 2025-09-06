"use client";
import { useState, useEffect } from "react";

interface Card {
  _id: string;
  name: string;
  mana: number;
  attack: number;
  health: number;
  rarity: string;
  description: string;
  tribe: string;
  type: string;
  class: string;
}

export default function CreatedCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomCards = async () => {
      try {
        const response = await fetch("/api/cards/custom");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch custom cards");
        setCards(data);
        setError("");
      } catch (err) {
        setError("Error fetching custom cards. Please try again.");
      }
    };
    fetchCustomCards();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-black pt-16 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Custom Cards</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {cards.length === 0 && !error && (
        <p>No custom cards found. Create some!</p>
      )}
      <div className="space-y-4">
        {cards.map((card) => (
          <div key={card._id} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold">
              {card.name} ({card.mana} Mana)
            </h2>
            <p>
              <strong>Class:</strong> {card.class}
            </p>
            <p>
              <strong>Type:</strong> {card.type}
            </p>
            <p>
              <strong>Rarity:</strong> {card.rarity}
            </p>
            {card.attack > 0 && (
              <p>
                <strong>Attack:</strong> {card.attack}
              </p>
            )}
            {card.health > 0 && (
              <p>
                <strong>Health:</strong> {card.health}
              </p>
            )}
            {card.tribe && (
              <p>
                <strong>Tribe:</strong> {card.tribe}
              </p>
            )}
            {card.description && (
              <p>
                <strong>Description:</strong> {card.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
