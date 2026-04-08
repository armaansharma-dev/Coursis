const Footer = () => {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="text-center space-y-6">
          {/* Coursis Text */}
          <p className="text-gray-700 text-sm">
            Coursis . Learn skills that actually matter . © 2026 All rights reserved.
          </p>

          {/* Creator Credit */}
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <span>Made with</span>
            <span className="text-red-500">❤️</span>
            <span>by</span>
            <a
              href="https://linktr.ee/armaansharma.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition"
            >
              Armaan Sharma
            </a>
          </div>

          {/* Connect Link */}
          <div>
            <a
              href="https://linktr.ee/armaansharma.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition text-sm font-medium"
            >
              <span>Connect with me</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer