export const metadata = {
  title: "cracked builders",
  description: "Chat with a database of cracked builders and their products",
};

export default function IndieHackerLayout({ children }: { children: React.ReactNode }) {
  return <main className="h-full flex flex-col">{children}</main>;
}
