import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen">
      <div className="flex flex-col h-full">
        <div className="h-12"></div>
        <div className="flex-auto flex justify-center items-center">
          <Link className="text-lg" href="/auth">
            Go Login
          </Link>
        </div>
      </div>
    </main>
  );
}
