import React from 'react';

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    const { hasError, error } = (this as any).state;
    if (hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(error?.message || "");
        if (parsedError.error) {
          errorMessage = `Firebase Error: ${parsedError.error} (${parsedError.operationType} on ${parsedError.path})`;
        }
      } catch (e) {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white text-center">
          <div className="max-w-md">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">Oops!</h2>
            <p className="text-gray-500 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-100"
            >
              RELOAD APP
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
