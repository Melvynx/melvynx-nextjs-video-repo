import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center gap-4 px-4 py-2 border-b">
      <Link href="/">Home</Link>
      <div className="flex-1" />
      <Link href="/auth/signin">Sign In</Link>
    </header>
  );
}
