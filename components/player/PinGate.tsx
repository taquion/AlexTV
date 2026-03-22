"use client";

import { useState, useRef } from "react";

interface PinGateProps {
  slug: string;
  onSuccess: () => void;
}

export default function PinGate({ slug, onSuccess }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (pin.length < 4) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/collections/validate-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, pin }),
      });
      const data = await res.json();

      if (data.valid) {
        onSuccess();
      } else {
        setShake(true);
        setError("Invalid PIN");
        setPin("");
        setTimeout(() => setShake(false), 500);
        inputRef.current?.focus();
      }
    } catch {
      setError("Connection error");
    }
    setLoading(false);
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length >= 8) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError("");
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-surface flex items-center justify-center">
      <div
        className={`text-center ${shake ? "animate-shake" : ""}`}
      >
        <h2 className="text-2xl font-bold mb-2">Enter PIN</h2>
        <p className="text-text-muted mb-8">This collection is protected</p>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-colors ${
                i < pin.length ? "bg-accent" : "bg-surface-border"
              }`}
            />
          ))}
        </div>

        <input
          ref={inputRef}
          type="password"
          value={pin}
          className="sr-only"
          autoFocus
          onChange={(e) => {
            setPin(e.target.value.replace(/[^0-9a-zA-Z]/g, "").slice(0, 8));
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"].map(
            (key) =>
              key === "" ? (
                <div key="empty" />
              ) : (
                <button
                  key={key}
                  onClick={() =>
                    key === "←" ? handleBackspace() : handleKeyPress(key)
                  }
                  className="w-16 h-16 bg-surface-alt hover:bg-surface-hover border border-surface-border rounded-xl text-xl font-medium transition-colors tv-focus"
                >
                  {key}
                </button>
              )
          )}
        </div>

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={pin.length < 4 || loading}
          className="px-8 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-xl font-medium text-lg transition-colors tv-focus"
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </div>
    </div>
  );
}
