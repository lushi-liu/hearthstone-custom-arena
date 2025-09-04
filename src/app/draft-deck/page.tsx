"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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

interface Card {
  _id?: string;
  cardId: string;
  name: string;
  mana: number;
  imageUrl: string;
}

export default function DraftDeck() {
  const [deckClass, setDeckClass] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [pickNumber, setPickNumber] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [classChoices, setClassChoices] = useState<string[]>([]);

  const allClasses = [
    "Druid",
    "Hunter",
    "Mage",
    "Paladin",
    "Priest",
    "Rogue",
    "Shaman",
    "Warlock",
    "Warrior",
  ];

  const getRandomClasses = () => {
    const shuffled = [...allClasses].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  // Fetch random cards for the current pick
  const fetchCards = async () => {
    if (isFetching) return;
    setIsFetching(true);
    console.log("Fetching cards for pick:", pickNumber, "class:", deckClass);
    try {
      const response = await fetch(`/api/cards/random?class=${deckClass}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch cards");
      setCards(data);
      setError("");
    } catch (err) {
      setError("Error fetching cards. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  // Handle class selection
  const handleClassSelect = (selectedClass: string) => {
    setDeckClass(selectedClass);
    setDeck([]);
    setPickNumber(1);
    setCards([]);
    setSuccess("");
    setError("");
  };

  // Handle card selection
  const handleCardSelect = async (card: Card) => {
    if (isFetching || pickNumber > 30) return;
    console.log("Selected card:", card.name, "for pick:", pickNumber);
    setDeck([...deck, card]);
    setPickNumber(pickNumber + 1);
    if (pickNumber < 30) {
      await fetchCards(); // Fetch next set of cards
    } else {
      try {
        const payload = {
          name: `${deckClass} Arena Draft`,
          class: deckClass,
          cardIds: [...deck, card].map((c) => c.cardId),
          type: "arena",
        };
        console.log("Saving deck payload:", payload);
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
        setClassChoices(getRandomClasses());
      } catch (err) {
        console.error("Deck save error");
        setError("Error saving deck. Please try again.");
      }
    }
  };

  // Calculate mana curve
  const manaCurve = deck.reduce((acc, card) => {
    const mana = Math.min(card.mana, 7);
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

  // Sort deck by mana cost, then name
  const sortedDeck = [...deck].sort((a, b) => {
    if (a.mana !== b.mana) return a.mana - b.mana;
    return a.name.localeCompare(b.name);
  });

  // Initialize class choices on mount
  useEffect(() => {
    setClassChoices(getRandomClasses());
  }, []);

  // Fetch cards when class is selected
  useEffect(() => {
    if (deckClass && cards.length === 0) {
      fetchCards();
    }
  }, [deckClass]);

  return (
    <div className="flex min-h-screen bg-gray-100 text-black pt-16">
      {/* Main Content: Draft Cards */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Arena Draft</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        {!deckClass ? (
          <div className="space-y-2">
            <h2 className="text-xl">Select a Class</h2>
            {classChoices.map((cls) => (
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
          <div>
            <h2 className="text-xl mb-4">
              Pick {pickNumber} of 30 - {deckClass}
            </h2>
            <div className="flex flex-row gap-4 w-full">
              {isFetching ? (
                <p>Loading cards...</p>
              ) : (
                cards.map((card) => (
                  <button
                    key={card.cardId}
                    onClick={() => handleCardSelect(card)}
                    className={`flex-none w-1/3 bg-white rounded shadow hover:shadow-lg ${
                      isFetching
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <div className="p-2">
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={300}
                        height={300}
                        className="w-full rounded"
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar: Deck List and Mana Curve */}
      {deckClass && (
        <div className="w-1/4 p-4 bg-gray-200 border-l border-gray-300">
          <h2 className="text-xl font-bold mb-4">
            Current Deck ({deck.length}/30)
          </h2>
          <div className="max-h-[50vh] overflow-y-auto">
            {sortedDeck.map((card, index) => (
              <div key={`${card.cardId}-${index}`} className="p-2">
                <span className="inline-block w-fit">
                  {card.name} ({card.mana} Mana)
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold">Mana Curve</h3>
            <div className="h-48">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
