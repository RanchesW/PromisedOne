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
      <section className="py-20 bg-white">
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
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Our professional dungeon masters and Game Masters are running games all over the world. Find a game that works for you and your schedule.
          </p>
        </div>
      </section>

      {/* Browse by Categories Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Firlest, serif' }}>
            Browse by categories
          </h2>
          <p className="text-lg text-slate-500 mb-12">
            Discover your next adventure on StartPlaying!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-5xl mx-auto">
            {/* Game System */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <span className="text-slate-700 font-semibold">Game System</span>
            </div>

            {/* Platform */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v1h12v-1l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>
                </svg>
              </div>
              <span className="text-slate-700 font-semibold">Platform</span>
            </div>

            {/* Genre */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="text-slate-700 font-semibold">Genre</span>
            </div>

            {/* Style */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-slate-700 font-semibold">Style</span>
            </div>

            {/* Mechanic */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86V6.5c-.6-.34-1-.98-1-1.72 0-1.1.9-2 2-2s2 .9 2 2c0 .74-.4 1.38-1 1.72v1.64C14.72 8.59 16 10.14 16 12z"/>
                </svg>
              </div>
              <span className="text-slate-700 font-semibold">Mechanic</span>
            </div>
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
