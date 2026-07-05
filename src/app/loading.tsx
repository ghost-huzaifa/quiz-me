export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center font-sans">
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-level-2 border border-outline-variant/30 flex flex-col items-center gap-4 max-w-xs w-full text-center">
        {/* Loading Spinner */}
        <div className="relative w-16 h-16">
          {/* Inner brand color spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-surface-variant"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <div>
          <h3 className="text-on-background font-bold text-lg leading-tight">Loading</h3>
          <p className="text-on-surface-variant text-sm mt-1">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
}
