interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center">
          {title}
        </h1>
        <p className="text-center text-gray-400 text-sm mt-1">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
