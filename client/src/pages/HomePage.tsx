import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Fantasy Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{
              backgroundImage: `url('/images/pxfuel.jpg')`
          }}
        ></div>
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/90"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white mb-6">
            KazRPG
          </h1>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-normal text-slate-300 mb-12">
            Tabletop RPGs Run by Professional Game Masters
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="/games"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-10 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Find Games →
            </a>
            <a
              href="/find-game-masters"
              className="border-2 border-white text-white hover:bg-white hover:text-slate-900 text-xl px-10 py-4 rounded-lg font-semibold transition-all duration-300"
            >
              Find Game Masters
            </a>
          </div>
        </div>
      </section>

      {/* What is KazRPG Section */}
      <section className="bg-white" style={{ paddingTop: '80px', paddingBottom: '0px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Firlest, serif' }}>
            What is <span className="text-blue-600">KazRPG</span>?
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
            KazRPG is the largest online platform for players to find tabletop roleplaying games and 
            professional GMs for any game system and any virtual tabletop!
          </p>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Are you looking to play D&D Online or find a virtual Pathfinder 2e group? We're part D&D Group finder (amongst other games) and part games finder.
          </p>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Our professional dungeon masters and Game Masters are running games all over the world. Find a game that works for you and your schedule.
          </p>
        </div>
      </section>

      {/* Browse by Categories Section */}
      <section className="bg-white" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: '30px' }}>
            Browse by categories
          </h2>
          <p className="text-slate-500 mb-12" style={{ fontSize: '16px' }}>
            Discover your next adventure on StartPlaying!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Game System */}
            <a href="/game-systems" className="flex flex-col items-center group cursor-pointer">
              <div className="w-46 h-46 mb-4 transition-transform group-hover:scale-105">
                <img 
                  src="/images/game-systems-circle-desktop.webp" 
                  alt="Game System"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-slate-700 font-semibold">Game System</span>
            </a>

            {/* Platform */}
            <a href="/platforms" className="flex flex-col items-center group cursor-pointer">
              <div className="w-46 h-46 mb-4 transition-transform group-hover:scale-105">
                <img 
                  src="/images/platforms-circle-desktop.webp" 
                  alt="Platform"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-slate-700 font-semibold">Platform</span>
            </a>

            {/* Genre */}
            <a href="/genres" className="flex flex-col items-center group cursor-pointer">
              <div className="w-46 h-46 mb-4 transition-transform group-hover:scale-105">
                <img 
                  src="/images/genres-circle-desktop.webp" 
                  alt="Genre"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-slate-700 font-semibold">Genre</span>
            </a>

            {/* Style */}
            <a href="/styles" className="flex flex-col items-center group cursor-pointer">
              <div className="w-46 h-46 mb-4 transition-transform group-hover:scale-105">
                <img 
                  src="/images/styles-circle-desktop.webp" 
                  alt="Style"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-slate-700 font-semibold">Style</span>
            </a>

            {/* Mechanic */}
            <a href="/mechanics" className="flex flex-col items-center group cursor-pointer">
              <div className="w-46 h-46 mb-4 transition-transform group-hover:scale-105">
                <img 
                  src="/images/mechanics-circle-desktop.webp" 
                  alt="Mechanic"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-slate-700 font-semibold">Mechanic</span>
            </a>
          </div>

          <div className="mt-12">
            <button className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Browse All Categories
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
