export default function HowItWorks() {
  return (
    <div className="py-12 border-t border-neutral-200">
      <h2 className="text-3xl font-bold text-center text-gradient">How The Enchanted Co. Works</h2>
      <div className="mt-10 grid gap-8 grid-cols-1 md:grid-cols-3">
        <div className="text-center px-4 py-6 rounded-lg hover:shadow-md transition-shadow">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-pink/20 text-brand-blue">
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
          <h3 className="mt-6 text-xl font-medium text-brand-blue">1. Find Babysitters</h3>
          <p className="mt-3 text-base text-neutral-600">
            Browse profiles of verified babysitters in your area, complete with reviews, skills, and availability.
          </p>
        </div>
        <div className="text-center px-4 py-6 rounded-lg hover:shadow-md transition-shadow">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-pink/20 text-brand-blue">
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
          <h3 className="mt-6 text-xl font-medium text-brand-blue">2. Book Care</h3>
          <p className="mt-3 text-base text-neutral-600">
            Request instant care or schedule in advance. Add details about your children and any special requirements.
          </p>
        </div>
        <div className="text-center px-4 py-6 rounded-lg hover:shadow-md transition-shadow">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-pink/20 text-brand-blue">
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
          <h3 className="mt-6 text-xl font-medium text-brand-blue">3. Enjoy Peace of Mind</h3>
          <p className="mt-3 text-base text-neutral-600">
            After the booking, rate and review your sitter. Build a reliable care network for your family.
          </p>
        </div>
      </div>
    </div>
  );
}
