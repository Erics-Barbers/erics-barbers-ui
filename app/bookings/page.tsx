
import Link from "next/link";

const isBookingEnabled = process.env.NEXT_PUBLIC_BOOKING_ENABLED === "true";

export default function Bookings() {
  if (!isBookingEnabled) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-black py-16">
        <div className="bg-[#181818] rounded-2xl shadow-lg p-10 max-w-xl w-full flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white mb-4">Bookings Coming Soon</h1>
          <p className="text-white/80">The booking feature is currently in development. Please check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-screen bg-black py-16">
      <div className="flex flex-row bg-[#181818] rounded-2xl shadow-lg overflow-hidden divide-x-2 divide-white/20 w-full max-w-2xl">
        <div className="flex flex-col items-center justify-center flex-1 p-10 gap-6">
          <h1 className="text-3xl font-bold text-white mb-4">Create a new booking</h1>
          <Link
            href="/bookings/new-booking"
            className="flex h-12 w-40 items-center justify-center rounded-full bg-white text-black font-semibold px-5 transition-colors hover:bg-[#383838] hover:text-white dark:hover:bg-[#ccc]"
          >
            Book
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 p-10 gap-6">
          <h1 className="text-3xl font-bold text-white mb-4">Manage an existing booking</h1>
          <Link
            href="/bookings/new-booking"
            className="flex h-12 w-40 items-center justify-center rounded-full border border-solid border-white/20 text-white px-5 transition-colors hover:border-transparent hover:bg-black/10 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
}
