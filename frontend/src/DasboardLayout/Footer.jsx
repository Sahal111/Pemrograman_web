export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="lg:pl-[260px] border-t border-gray-200 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col sm:flex-row
        items-center justify-between gap-2">
        <p className="text-xs text-gray-400">
          © {year} <span className="font-semibold text-blue-600">TaskFlow</span>. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
          <a href="#" className="hover:text-blue-600 transition">Help Center</a>
        </div>
      </div>
    </footer>
  );
}
