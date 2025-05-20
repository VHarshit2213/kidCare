export default function HowItWorks() {
  return (
    <div className="py-16 border-t border-neutral-100 bg-[#f8f5ff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-[#7e57c2] tracking-tight">How The Enchanted Co. Works</h2>
        <div className="mt-14 grid gap-10 grid-cols-1 md:grid-cols-3">
          {/* First step - midcentury modern style card */}
          <div className="text-center p-8 bg-white border border-[#7e57c2]/10 hover:border-[#7e57c2]/30 rounded-[4px] transition-all hover:shadow-lg group">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-[4px] bg-[#7e57c2]/10 text-[#7e57c2] group-hover:bg-[#7e57c2]/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-medium text-[#7e57c2] tracking-wide">1. Find Babysitters</h3>
            <p className="mt-4 text-base text-neutral-700 leading-relaxed">
              Browse profiles of verified babysitters in your area, complete with reviews, skills, and availability.
            </p>
          </div>
          
          {/* Second step - midcentury modern style card */}
          <div className="text-center p-8 bg-white border border-[#7e57c2]/10 hover:border-[#7e57c2]/30 rounded-[4px] transition-all hover:shadow-lg group">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-[4px] bg-[#7e57c2]/10 text-[#7e57c2] group-hover:bg-[#7e57c2]/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-medium text-[#7e57c2] tracking-wide">2. Book Care</h3>
            <p className="mt-4 text-base text-neutral-700 leading-relaxed">
              Request instant care or schedule in advance. Add details about your children and any special requirements.
            </p>
          </div>
          
          {/* Third step - midcentury modern style card */}
          <div className="text-center p-8 bg-white border border-[#7e57c2]/10 hover:border-[#7e57c2]/30 rounded-[4px] transition-all hover:shadow-lg group">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-[4px] bg-[#7e57c2]/10 text-[#7e57c2] group-hover:bg-[#7e57c2]/20 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="mt-6 text-xl font-medium text-[#7e57c2] tracking-wide">3. Enjoy Peace of Mind</h3>
            <p className="mt-4 text-base text-neutral-700 leading-relaxed">
              After the booking, rate and review your sitter. Build a reliable care network for your family.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
