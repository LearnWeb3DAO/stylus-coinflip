import { Play } from "@/components/play";

export default function Home() {
  return (
    <div className="max-w-7xl h-[calc(100vh-4rem)] justify-center w-full mx-auto flex flex-col items-center gap-4">
      <h1 className="text-4xl font-bold">Test your luck</h1>
      <Play />
    </div>
  );
}
