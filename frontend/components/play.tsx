"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount } from "wagmi";

export function Play() {
  const [coinSide, setCoinSide] = useState<"heads" | "tails">("heads");
  const [betAmount, setBetAmount] = useState<string>("0.01");

  const { isConnected } = useAccount();

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex items-center gap-4">
        <CoinOption
          src="/heads.png"
          alt="heads"
          active={coinSide === "heads"}
          onClick={() => setCoinSide("heads")}
        />
        <CoinOption
          src="/tails.png"
          alt="tails"
          active={coinSide === "tails"}
          onClick={() => setCoinSide("tails")}
        />
      </div>

      <div className="flex items-center gap-4">
        <BetOption
          amount="0.01"
          active={betAmount === "0.01"}
          onClick={() => setBetAmount("0.01")}
        />
        <BetOption
          amount="0.05"
          active={betAmount === "0.05"}
          onClick={() => setBetAmount("0.05")}
        />
        <BetOption
          amount="0.1"
          active={betAmount === "0.1"}
          onClick={() => setBetAmount("0.1")}
        />
        <BetOption
          amount="0.5"
          active={betAmount === "0.5"}
          onClick={() => setBetAmount("0.5")}
        />
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-gray-500">
          Bet: {betAmount} ETH on {coinSide === "heads" ? "Heads" : "Tails"}
        </span>
        <span className="text-sm text-gray-500">
          Potential Winnings: {Number(betAmount) * 1.9} ETH
        </span>
      </div>

      {isConnected ? (
        <button className="bg-blue-600 hover:bg-blue-700 transition-all text-white text-xl px-6 py-3 rounded-lg">
          Flip
        </button>
      ) : (
        <ConnectButton />
      )}
    </div>
  );
}

function CoinOption({
  src,
  alt,
  active,
  onClick,
}: {
  src: string;
  alt: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 ${
        active ? "bg-gray-100" : ""
      }`}
      onClick={onClick}
    >
      <img src={src} alt={alt} className="size-40" />
    </div>
  );
}

function BetOption({
  amount,
  active,
  onClick,
}: {
  amount: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
        active
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
      }`}
      onClick={onClick}
    >
      {amount} ETH
    </button>
  );
}
