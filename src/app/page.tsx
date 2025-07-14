// import Image from 'next/image'; // Commented out - no images needed

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-gray-200 font-sans">
      <header className="bg-gradient-to-b from-gray-900 to-black py-8 px-4 text-center">
        {/* 
        <Image
          src="/logo.svg"
          alt="Chrome Sphynx Audio Logo"
          width={180}
          height={180}
          className="mx-auto mb-4"
        />
        */}
        {/* Simple text logo replacement */}
        <div className="mx-auto mb-4 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-4xl font-bold">CSA</span>
        </div>
        
        <h1 className="text-4xl font-extrabold">Chrome Sphynx Audio</h1>
        <p className="mt-2 text-xl italic text-gray-400">
          Cutting-edge VST3 Plugins for Abstract Sound Design
        </p>
      </header>

      <section className="py-12 px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Plugins</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Plugin Card 1 */}
          <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden hover:scale-105 transition-transform">
            {/* 
            <Image
              src="/plugin1.jpg"
              alt="Plugin Name"
              width={800}
              height={500}
              className="object-cover"
            />
            */}
            {/* Simple colored placeholder for image */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">Plugin Image</span>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold">Spectral Morph</h3>
              <p className="text-gray-400 mt-2">
                Transform sounds with spectral precision and advanced morphing algorithms.
              </p>
              <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* Plugin Card 2 */}
          <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden hover:scale-105 transition-transform">
            <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">Plugin Image</span>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold">Chaos Generator</h3>
              <p className="text-gray-400 mt-2">
                Create unpredictable and evolving soundscapes with controlled chaos.
              </p>
              <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors">
                Learn More
              </button>
            </div>
          </div>

          {/* Plugin Card 3 */}
          <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden hover:scale-105 transition-transform">
            <div className="h-48 bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">Plugin Image</span>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold">Dimensional Reverb</h3>
              <p className="text-gray-400 mt-2">
                Immersive spatial audio processing with multi-dimensional reverb.
              </p>
              <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-12 px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Experience Innovation</h2>
        
        {/* 
        <video
          controls
          className="mx-auto rounded-xl shadow-xl max-w-3xl w-full"
          src="/promo.mp4"
        />
        */}
        
        {/* Simple text replacement for video */}
        <div className="mx-auto rounded-xl shadow-xl max-w-3xl w-full bg-gradient-to-r from-gray-800 to-gray-700 p-12 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-2xl font-bold mb-4">Promotional Video</h3>
          <p className="text-gray-300 mb-6">
            Watch our latest showcase of Chrome Sphynx Audio plugins in action. 
            Experience the cutting-edge sound design capabilities that push the boundaries of audio production.
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg transition-colors">
            ▶ Play Demo
          </button>
        </div>
      </section>

      <section className="py-12 px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Chrome Sphynx Audio?</h2>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🔬</div>
            <h3 className="text-xl font-bold mb-2">Advanced Algorithms</h3>
            <p className="text-gray-400">
              Our plugins use cutting-edge DSP algorithms developed specifically for abstract sound design.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🎛️</div>
            <h3 className="text-xl font-bold mb-2">Intuitive Interface</h3>
            <p className="text-gray-400">
              Clean, modern interfaces that make complex sound manipulation accessible to all producers.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">CPU Optimized</h3>
            <p className="text-gray-400">
              Efficient processing ensures smooth performance even with multiple plugin instances.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">VST3 Standard</h3>
            <p className="text-gray-400">
              Full VST3 compatibility ensures seamless integration with your favorite DAW.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 text-center bg-gradient-to-t from-gray-900 to-black">
        <p className="text-sm text-gray-500">
          © 2025 Chrome Sphynx Audio | All rights reserved
        </p>
        <nav className="mt-2">
          <a href="#" className="text-indigo-400 hover:text-indigo-200 mx-2 transition-colors">
            Privacy
          </a>
          <a href="#" className="text-indigo-400 hover:text-indigo-200 mx-2 transition-colors">
            Contact
          </a>
          <a href="#" className="text-indigo-400 hover:text-indigo-200 mx-2 transition-colors">
            Support
          </a>
        </nav>
      </footer>
    </main>
  );
}
