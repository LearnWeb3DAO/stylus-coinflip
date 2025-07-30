import { CoinflipAddress } from "@/lib/coinflip";
import Link from "next/link";

export function Footer() {
  return (
    <div className="max-w-7xl w-full mx-auto flex items-center justify-between h-16">
      <p className="text-sm text-gray-500">
        Learn how to build this on{" "}
        <Link
          href="https://learnweb3.io/"
          target="_blank"
          className="text-blue-500 hover:text-blue-600"
        >
          LearnWeb3 x Arbitrum Stylus
        </Link>
      </p>
      <Link
        href={`https://sepolia.arbiscan.io/address/${CoinflipAddress}`}
        target="_blank"
        className="text-sm text-gray-500 hover:text-blue-600"
      >
        View Coinflip on Arbiscan
      </Link>
    </div>
  );
}
