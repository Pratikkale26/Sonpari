import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Sonpari</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <a href="#" className="transition-colors hover:text-amber-600">
                About
              </a>
              <a href="#" className="transition-colors hover:text-amber-600">
                How it Works
              </a>
              <a href="#" className="transition-colors hover:text-amber-600">
                Privacy
              </a>
              <a href="#" className="transition-colors hover:text-amber-600">
                Terms
              </a>
              <a href="#" className="transition-colors hover:text-amber-600">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 text-center">
            <p className="flex items-center justify-center gap-2 text-sm text-gray-600">
              Built with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> for families
            </p>
            <p className="mt-2 text-xs text-gray-500">
              © 2026 Sonpari. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
