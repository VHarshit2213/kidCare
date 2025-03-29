export default function HowItWorks() {
  return (
    <div className="py-8 border-t border-neutral-200">
      <h2 className="text-2xl font-bold text-neutral-800 text-center">How KidCare Works</h2>
      <div className="mt-8 grid gap-8 grid-cols-1 md:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          <h3 className="mt-4 text-lg font-medium text-neutral-800">1. Find Babysitters</h3>
          <p className="mt-2 text-base text-neutral-600">
            Browse profiles of verified babysitters in your area, complete with reviews, skills, and availability.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          <h3 className="mt-4 text-lg font-medium text-neutral-800">2. Book Care</h3>
          <p className="mt-2 text-base text-neutral-600">
            Request instant care or schedule in advance. Add details about your children and any special requirements.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          <h3 className="mt-4 text-lg font-medium text-neutral-800">3. Enjoy Peace of Mind</h3>
          <p className="mt-2 text-base text-neutral-600">
            After the booking, rate and review your sitter. Build a reliable care network for your family.
          </p>
        </div>
      </div>
    </div>
  );
}
