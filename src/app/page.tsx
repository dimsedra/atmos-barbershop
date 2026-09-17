export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-xs uppercase tracking-[0.25em] text-[#8E8D8A] font-semibold">
          Ecosystem Foundation
        </span>
        <h1 className="text-4xl font-bold tracking-tight font-display text-[#121214]">
          ATMOS
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Hair Lounge & Sensory Sanctuary. Foundation initialized with Next.js 15, React 19, and Tailwind CSS v4.
        </p>
      </div>
    </main>
  );
}
