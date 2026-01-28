export default function Information() {
  return (
    <div className="flex flex-col w-full min-h-screen py-8 px-48 bg-white dark:bg-black">
      {/* Opening Hours Section */}
      <div className="w-full flex flex-col items-center py-8 bg-zinc-200 dark:bg-zinc-800 rounded-b-lg mb-8 shadow">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
          Opening Hours
        </h2>
        <table className="text-lg text-zinc-700 dark:text-zinc-200">
          <tbody>
            <tr>
              <td className="pr-8">Monday - Friday:</td>
              <td>09:00 - 19:00</td>
            </tr>
            <tr>
              <td className="pr-8">Saturday:</td>
              <td>09:00 - 19:00</td>
            </tr>
            <tr>
              <td className="pr-8">Sunday:</td>
              <td>Closed</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row flex-1 w-full gap-8">
        {/* Left: Contact Info */}
        <div className="flex-1 flex flex-col justify-center items-start p-10 bg-zinc-100 dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-300 dark:border-zinc-800">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
            Contact
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-2">
            Name: Eric
          </p>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-2">
            Email:{' '}
            <a
              href="mailto:eric@example.com"
              className="underline hover:text-blue-600"
            >
              eric@example.com
            </a>
          </p>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            Phone:{' '}
            <a
              href="tel:+44 7704 548662"
              className="underline hover:text-blue-600"
            >
              +44 7704 548662
            </a>
          </p>
        </div>

        {/* Right: Location Info */}
        <div className="flex-1 flex flex-col justify-center items-start p-10 bg-zinc-50 dark:bg-zinc-950 rounded-b-lg">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
            Location
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-1">
            277A Dunstable Road
          </p>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-1">
            Maidenhall
          </p>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-1">Luton</p>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            United Kingdom, LU4 8BS
          </p>
          <a
            href="https://maps.app.goo.gl/AzbZFsA3cZB4Qfow7"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-6 py-2 text-white font-semibold rounded-lg shadow hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          >
            View on Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
