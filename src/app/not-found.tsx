export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gradient">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="text-muted-foreground">
          A página que você procura não existe.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 mt-4 gradient-purple hover:gradient-purple-hover text-white rounded-lg font-medium transition-all"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
