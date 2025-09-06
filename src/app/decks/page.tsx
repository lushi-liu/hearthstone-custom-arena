"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Card {
  cardId: string;
  name: string;
  mana: number;
  imageUrl: string;
}

interface Deck {
  _id: string;
  name: string;
  class: string;
  cards: Card[];
}

export default function Decks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [error, setError] = useState("");
  const [expandedDecks, setExpandedDecks] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch("/api/decks");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch decks");
        setDecks(data);
        setExpandedDecks(
          data.reduce((acc: { [key: string]: boolean }, deck: Deck) => {
            acc[deck._id] = false;
            return acc;
          }, {})
        );
        setError("");
      } catch (err) {
        setError("Error fetching decks. Please try again.");
      }
    };
    fetchDecks();
  }, []);

  const toggleDeck = (deckId: string) => {
    setExpandedDecks((prev) => ({
      ...prev,
      [deckId]: !prev[deckId],
    }));
  };

  const handleDelete = async (deckId: string, deckName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${deckName}"?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete deck");
      setDecks(decks.filter((deck) => deck._id !== deckId));
      setExpandedDecks((prev) => {
        const newState = { ...prev };
        delete newState[deckId];
        return newState;
      });
      setError("");
    } catch (err) {
      setError("Error deleting deck. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black pt-16 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Arena Decks</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {decks.length === 0 && !error && (
        <p>No decks found. Start a new draft!</p>
      )}
      <div className="space-y-6">
        {decks.map((deck) => (
          <div key={deck._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">
                {deck.name} ({deck.class})
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleDeck(deck._id)}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-800"
                >
                  {expandedDecks[deck._id] ? "Hide Cards" : "Show Cards"}
                </button>
                <button
                  onClick={() => handleDelete(deck._id, deck.name)}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
            {expandedDecks[deck._id] && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {deck.cards.map((card, index) => (
                  <div
                    key={`${card.cardId}-${index}`}
                    className="flex flex-col items-center"
                  >
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      width={128}
                      height={192}
                      className="rounded"
                    />
                    <span className="text-sm mt-1 text-center">
                      {card.name} ({card.mana} Mana)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
