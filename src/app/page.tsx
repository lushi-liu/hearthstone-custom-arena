"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [cards, setCards] = useState([]);

  // Fetch 3 random cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch("/api/cards/random?limit=3");
        const data = await response.json();
        if (response.ok) {
          setCards(data);
        } else {
          console.error("Failed to fetch cards:", data.error);
          setCards([]);
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
        setCards([]);
      }
    };
    fetchCards();
  }, []);

  // Placeholder card if database is empty
  const placeholderCard = (index: number) => ({
    cardId: `placeholder-${index}`,
    imageUrl: "",
    name: `Card ${index}`,
  });

  // Use fetched cards or placeholders
  const displayCards =
    cards.length > 0 ? cards : [1, 2, 3].map((i) => placeholderCard(i));

  return (
    <div className="min-h-screen bg-gray-100 text-black pt-16 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to Hearthstone Playground!
      </h1>
      <p className="text-lg mb-6 text-center max-w-md">
        Arena draft simulator and card creation
      </p>
      <div className="flex-row space-x-4">
        <Link
          href="/draft-deck"
          className="px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 font-semibold"
        >
          Start Arena Draft
        </Link>
        <Link
          href="/create-card"
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-800 transition-colors duration-200 font-semibold"
        >
          Create a Custom Card
        </Link>
      </div>

      <div className="mt-8 flex gap-4">
        {displayCards.map((card, i) => (
          <div
            key={card.cardId}
            className={`w-32 h-48 rounded shadow-lg transform transition-transform duration-500 hover:scale-105 card-${
              i + 1
            }`}
          >
            <Image
              width={300}
              height={300}
              src={
                card.imageUrl || "https://via.placeholder.com/128x192?text=Card"
              }
              alt={card.name}
              className={`w-full h-full rounded object-cover ${
                !card.imageUrl
                  ? "bg-gradient-to-b from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold"
                  : ""
              }`}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .card-1 {
          transform: rotate(-5deg) translateY(0);
          animation: shuffle-1 1s ease-in-out;
        }
        .card-2 {
          transform: rotate(0deg) translateY(-10px);
          animation: shuffle-2 1s ease-in-out;
        }
        .card-3 {
          transform: rotate(5deg) translateY(0);
          animation: shuffle-3 1s ease-in-out;
        }
        @keyframes shuffle-1 {
          0% {
            transform: rotate(0deg) translateY(50px);
          }
          100% {
            transform: rotate(-5deg) translateY(0);
          }
        }
        @keyframes shuffle-2 {
          0% {
            transform: rotate(0deg) translateY(50px);
          }
          100% {
            transform: rotate(0deg) translateY(-10px);
          }
        }
        @keyframes shuffle-3 {
          0% {
            transform: rotate(0deg) translateY(50px);
          }
          100% {
            transform: rotate(5deg) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
