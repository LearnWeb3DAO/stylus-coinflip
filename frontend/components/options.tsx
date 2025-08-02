export function CoinOption({
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

export function BetOption({
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
