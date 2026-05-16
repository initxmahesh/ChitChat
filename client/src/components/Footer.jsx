export default function Footer() {
  return (
    <footer className="relative z-10 py-2 text-center">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm text-gray-400 mb-2">
        <button className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </button>
        <button className="hover:text-gray-600 transition-colors">
          Terms of Service
        </button>
        <button className="hover:text-gray-600 transition-colors">
          Help Center
        </button>
      </div>
      <p className="text-xs text-gray-400">
        &copy; 2025 Palm. All rights reserved.
      </p>
    </footer>
  );
}
