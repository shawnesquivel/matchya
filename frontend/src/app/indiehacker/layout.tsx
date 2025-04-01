export const metadata = {
  title: "Indie Hacker Chatbot",
  description: "Chat with a database of indie hackers and their products",
};

export default function IndieHackerLayout({ children }: { children: React.ReactNode }) {
  return <main className="h-full flex flex-col">{children}</main>;
}
