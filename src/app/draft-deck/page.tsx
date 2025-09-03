"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ArenaDraft() {
  const [deckClass, setDeckClass] = useState("");
  const [cards, setCards] = useState([]);
  const [deck, setDeck] = useState([]);
  const [pickNumber, setPickNumber] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch random cards for the current pick
  const fetchCards = async () => {
    try {
      const response = await fetch(`/api/cards/random?class=${deckClass}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch cards");
      setCards(data);
      setError("");
    } catch (err) {
      setError("Error fetching cards. Please try again.");
    }
  };

  // Handle class selection
  const handleClassSelect = (selectedClass) => {
    setDeckClass(selectedClass);
    setDeck([]);
    setPickNumber(1);
    setCards([]);
    fetchCards();
  };

  // Handle card selection
  const handleCardSelect = async (card) => {
    if (pickNumber <= 30) {
      setDeck([...deck, card]);
      setPickNumber(pickNumber + 1);
      if (pickNumber < 30) {
        fetchCards();
      } else {
        // Save deck when complete
        try {
          const response = await fetch("/api/decks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `${deckClass} Arena Draft`,
              class: deckClass,
              cardIds: [...deck, card].map((c) => c.cardId),
              type: "arena",
            }),
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.error || "Failed to save deck");
          setSuccess("Deck saved successfully!");
          setDeck([]);
          setPickNumber(1);
          setCards([]);
          setDeckClass("");
        } catch (err) {
          setError("Error saving deck. Please try again.");
        }
      }
    }
  };

  // Calculate mana curve
  const manaCurve = deck.reduce((acc, card) => {
    const mana = Math.min(card.mana, 7); // Cap at 7+ for chart
    acc[mana] = (acc[mana] || 0) + 1;
    return acc;
  }, Array(8).fill(0));

  const chartData = {
    labels: ["0", "1", "2", "3", "4", "5", "6", "7+"],
    datasets: [
      {
        label: "Mana Curve",
        data: manaCurve,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
    maintainAspectRatio: false,
  };

  // Fetch cards when class is selected
  useEffect(() => {
    if (deckClass && pickNumber <= 30) {
      fetchCards();
    }
  }, [deckClass, pickNumber]);

  return (
    <div className="flex-1 p-4 min-w-0">
      <h1 className="text-2xl font-bold mb-4">Arena Draft</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      {!deckClass ? (
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl">Select a Class</h2>
          {[
            "Druid",
            "Hunter",
            "Mage",
            "Paladin",
            "Priest",
            "Rogue",
            "Shaman",
            "Warlock",
            "Warrior",
          ].map((cls) => (
            <button
              key={cls}
              onClick={() => handleClassSelect(cls)}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {cls}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          <h2 className="text-xl mb-4 w-full text-center">
            Pick {pickNumber} of 30 - {deckClass}
          </h2>
          {cards.map((card) => (
            <div
              key={card.cardId}
              className="inline-block text-center max-w-[200px]"
            >
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full max-w-[200px] rounded object-contain cursor-pointer"
                onClick={() => handleCardSelect(card)}
              />
              <div className="mt-1">
                <p className="font-bold text-xs truncate">{card.name}</p>
                <p className="text-xs">
                  {card.mana} Mana {card.type}
                </p>
                <p className="text-xs">{card.class}</p>
                <p className="text-xs truncate">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
