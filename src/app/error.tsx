'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md px-4">
        <h1 className="text-6xl font-bold text-gradient">500</h1>
        <h2 className="text-2xl font-semibold text-foreground">Algo deu errado!</h2>
        <p className="text-muted-foreground">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <button
          onClick={() => reset()}
          className="inline-block px-6 py-3 mt-4 gradient-purple hover:gradient-purple-hover text-white rounded-lg font-medium transition-all"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
