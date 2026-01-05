'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log global error with digest for tracking
    console.error('Global error boundary caught:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html lang="pt-PT">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center space-y-4 max-w-md px-4">
            <h1 className="text-6xl font-bold">500</h1>
            <h2 className="text-2xl font-semibold">Algo deu errado!</h2>
            <p className="text-muted-foreground">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                ID de Referência: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              className="inline-block px-6 py-3 mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
