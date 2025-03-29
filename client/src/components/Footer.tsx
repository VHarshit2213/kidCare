export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} The Enchanted Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}