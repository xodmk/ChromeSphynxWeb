import Image from 'next/image';

export default function Home() { return ( <main className="min-h-screen bg-black text-gray-200 font-sans"> <header className="bg-gradient-to-b from-gray-900 to-black py-8 px-4 text-center"> <Image
src="/logo.svg"
alt="Chrome Sphynx Audio Logo"
width={180}
height={180}
className="mx-auto mb-4"
/> <h1 className="text-4xl font-extrabold">Chrome Sphynx Audio</h1> <p className="mt-2 text-xl italic text-gray-400"> Cutting-edge VST3 Plugins for Abstract Sound Design </p> </header>

<section className="py-12 px-8">
    <h2 className="text-3xl font-bold text-center mb-8">Our Plugins</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Example Plugin Card */}
      <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden hover:scale-105 transition-transform">
        <Image
          src="/plugin1.jpg"
          alt="Plugin Name"
          width={800}
          height={500}
          className="object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-bold">Spectral Morph</h3>
          <p className="text-gray-400 mt-2">
            Transform sounds with spectral precision.
          </p>
          <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded">
            Learn More
          </button>
        </div>
      </div>

      {/* Add more plugins similarly... */}
    </div>
  </section>

  <section className="bg-gray-950 py-12 px-8">
    <h2 className="text-3xl font-bold text-center mb-8">Experience Innovation</h2>
    <video
      controls
      className="mx-auto rounded-xl shadow-xl max-w-3xl w-full"
      src="/promo.mp4"
    />
  </section>

  <footer className="py-8 px-4 text-center bg-gradient-to-t from-gray-900 to-black">
    <p className="text-sm text-gray-500">
      © 2025 Chrome Sphynx Audio | All rights reserved
    </p>
    <nav className="mt-2">
      <a href="#" className="text-indigo-400 hover:text-indigo-200 mx-2">
        Privacy
      </a>
      <a href="#" className="text-indigo-400 hover:text-indigo-200 mx-2">
        Contact
      </a>
      <a href="#" className="text-indigo-400 hover:text-indigo-200 mx-2">
        Support
      </a>
    </nav>
  </footer>
</main>

); }


