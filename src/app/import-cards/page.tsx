"use client";
import { useState } from "react";

export default function ImportCards() {
  const [build, setBuild] = useState("latest");
  const [set, setSet] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImport = async () => {
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/cards/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ build, set }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to import");
      setSuccess(`Imported ${result.importedCount} cards!`);
    } catch (err) {
      setError("Error importing cards. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Import Hearthstone Cards</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div className="space-y-4">
        <div>
          <label className="block">Build Number</label>
          <input
            type="text"
            value={build}
            onChange={(e) => setBuild(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., latest or 26872"
          />
        </div>
        <div>
          <label className="block">Set (optional, e.g., NAXX)</label>
          <input
            type="text"
            value={set}
            onChange={(e) => setSet(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., NAXX, TGT"
          />
        </div>
        <button
          onClick={handleImport}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Import Cards
        </button>
        <p className="text-sm text-gray-600">
          Find build numbers for historical metas at{" "}
          <a
            href="https://wowpedia.fandom.com/wiki/Patch"
            target="_blank"
            className="text-blue-500"
          >
            Wowpedia
          </a>{" "}
          or Hearthstone patch notes.
        </p>
      </div>
    </div>
  );
}
