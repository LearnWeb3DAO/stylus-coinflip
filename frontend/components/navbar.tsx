import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <div className="max-w-7xl w-full mx-auto flex items-center justify-between h-16">
      <p className="text-2xl font-bold">💰 Coinflip</p>
      <ConnectButton />
    </div>
  );
}
