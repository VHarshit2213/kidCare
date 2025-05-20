export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-[#7e57c2] font-medium text-lg tracking-wide">The Enchanted Co.</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Bringing peace of mind to parents with reliable, background-checked babysitters available when you need them.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-[#7e57c2] font-medium text-lg tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-neutral-600 hover:text-[#7e57c2] text-sm">Home</a></li>
              <li><a href="/bookings" className="text-neutral-600 hover:text-[#7e57c2] text-sm">My Bookings</a></li>
              <li><a href="/messages" className="text-neutral-600 hover:text-[#7e57c2] text-sm">Messages</a></li>
              <li><a href="/profile" className="text-neutral-600 hover:text-[#7e57c2] text-sm">Profile</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-[#7e57c2] font-medium text-lg tracking-wide">Contact</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Questions? Need support?<br />
              Email us at <a href="mailto:support@enchantedco.com" className="text-[#7e57c2]">support@enchantedco.com</a>
            </p>
          </div>
        </div>
        
        <div className="flex justify-center items-center mt-10 pt-6 border-t border-neutral-100">
          <p className="text-sm text-neutral-500 tracking-wide">© {new Date().getFullYear()} The Enchanted Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}