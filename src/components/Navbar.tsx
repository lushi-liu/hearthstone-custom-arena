"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tight">
          Hearthstone Arena
        </div>
        <div className="flex space-x-4">
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200 font-semibold"
          >
            Home
          </Link>
          <Link
            href="/create-card"
            className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200 font-semibold"
          >
            Create Cards
          </Link>
          <Link
            href="/created-cards"
            className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200 font-semibold"
          >
            View Created Cards
          </Link>
          <Link
            href="/import-cards"
            className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200 font-semibold"
          >
            Import Cards
          </Link>
          <Link
            href="/draft-deck"
            className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200 font-semibold"
          >
            Draft a Deck
          </Link>
          <Link
            href="/decks"
            className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200 font-semibold"
          >
            View Decks
          </Link>
        </div>
      </div>
    </nav>
  );
}
