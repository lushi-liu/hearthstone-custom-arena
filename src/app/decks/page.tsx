"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Card {
  cardId: string;
  name: string;
  mana: number;
}

interface Deck {
  _id: string;
  name: string;
  class: string;
  cardIds: Card[];
  type: string;
}

export default function ViewDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch("/api/decks");
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to fetch decks");
        setDecks(data);
      } catch (err) {
        setError("Error fetching decks. Please try again.");
      }
    };
    fetchDecks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-black pt-16 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Arena Decks</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {decks.length === 0 ? (
        <p className="text-lg">
          No decks found.{" "}
          <Link href="/DraftDeck" className="text-blue-500 hover:underline">
            Draft one now!
          </Link>
        </p>
      ) : (
        <div className="space-y-6">
          {decks.map((deck) => (
            <div key={deck._id} className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-bold">
                {deck.name} ({deck.class})
              </h2>
              <div className="mt-2 max-h-[50vh] overflow-y-auto">
                {deck.cardIds
                  .sort((a, b) =>
                    a.mana !== b.mana
                      ? a.mana - b.mana
                      : a.name.localeCompare(b.name)
                  )
                  .map((card, index) => (
                    <div key={`${card.cardId}-${index}`} className="p-2">
                      <span className="inline-block w-fit">
                        {card.name} ({card.mana} Mana)
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
