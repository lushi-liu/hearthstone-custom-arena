"use client";
import { useState, useEffect } from "react";

const classes = [
  "Mage",
  "Shaman",
  "Warrior",
  "Druid",
  "Hunter",
  "Paladin",
  "Priest",
  "Rogue",
  "Warlock",
];

export default function ArenaDraft() {
  const [step, setStep] = useState("class"); // 'class', 'draft', 'complete'
  const [deckClass, setDeckClass] = useState("");
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [deckName, setDeckName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Randomly select 3 classes
  useEffect(() => {
    if (step === "class") {
      const shuffled = classes.sort(() => Math.random() - 0.5).slice(0, 3);
      setClassOptions(shuffled);
    }
  }, [step]);

  // Fetch 3 random cards for the current pick
  useEffect(() => {
    if (step === "draft" && selectedCards.length < 30) {
      fetch(`/api/cards/random?class=${deckClass}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else setCards(data);
        });
    }
  }, [step, selectedCards, deckClass]);

  const selectClass = (cls: string) => {
    setDeckClass(cls);
    setStep("draft");
  };

  const selectCard = (cardId: string) => {
    if (selectedCards.length < 30) {
      setSelectedCards([...selectedCards, cardId]);
      if (selectedCards.length + 1 === 30) {
        setStep("complete");
      } else {
        setCards([]); // Trigger new card fetch
      }
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
          cards: selectedCards,
        }),
      });
      if (!response.ok) throw new Error("Failed to save deck");
      setSuccess("Deck saved successfully!");
      setDeckName("");
      setSelectedCards([]);
      setDeckClass("");
      setStep("class");
    } catch (err) {
      setError("Error saving deck. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Arena Draft</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      {step === "class" && (
        <div>
          <h2 className="text-xl mb-2">Choose a Class</h2>
          <div className="flex gap-4">
            {classOptions.map((cls) => (
              <button
                key={cls}
                onClick={() => selectClass(cls)}
                className="p-4 bg-blue-500 text-white rounded"
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "draft" && (
        <div>
          <h2 className="text-xl mb-2">
            Pick {selectedCards.length + 1} of 30 (Class: {deckClass})
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {cards.map((card) => (
              <div
                key={card._id}
                onClick={() => selectCard(card._id)}
                className="border p-2 cursor-pointer hover:bg-blue-100"
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
                  {card.rarity} {card.type} - {card.class}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "complete" && (
        <div>
          <h2 className="text-xl mb-2">Deck Complete! ({deckClass})</h2>
          <div className="mb-4">
            <label className="block">Deck Name</label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full p-2 bg-blue-500 text-white rounded"
          >
            Save Deck
          </button>
        </div>
      )}
    </div>
  );
}
