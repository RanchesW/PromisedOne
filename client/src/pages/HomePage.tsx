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

      {/* Browse Popular D&D Adventures Section */}
      <section className="bg-white" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: '30px' }}>
              Browse Popular Dungeons & Dragons Adventures
            </h2>
            <p className="text-slate-500" style={{ fontSize: '16px' }}>
              Browse 100's of tabletop roleplaying games run by professional Dungeon Masters. Find your favorite TTRPG system and start playing online today!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Curse of Strahd */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/curse-of-strahd" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/66197b47-5e2b-426b-8feb-f6823c47b772")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Curse of Strahd
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    The vampire Count Strahd von Zarovich, one of D&D's most iconic villains, is the undisputed master of his hidden domain of Barovia. While his reign of terror breaks the spirits of his subjects, he himself is a prisoner; Barovia is a demiplane, a pocket dimension which traps both the vampire and his victims, to Strahd to possess, enthrall, or dispose of as he sees fit.
                  </p>
                </div>
              </a>
            </div>

            {/* Lost Mine of Phandelver */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/lost-mine-of-phandelver" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/10d36ac1-ee47-49ee-be0b-f1d2029a2b98")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Lost Mine of Phandelver
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Legends long have spoken of the lost mine, rich in ore and magic, in the hills outside the frontier town of Phandalin, but no one has ever found it… until now. The Rockseeker brothers, a trio of dwarven prospectors, have unearthed the entrance to the near-mythical mine, and they're hiring rough-and-tumble adventurers to help them reopen it.
                  </p>
                </div>
              </a>
            </div>

            {/* Phandelver and Below */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/phandelver-and-below-the-shattered-obelisk" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/b7fb53c6-99f1-49c6-b4e1-45c90e0fdac8")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Phandelver and Below: The Shattered Obelisk
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Evil is lurking in the beloved town of Phandalin, and you and your party are the only ones who can stop it. Solve mysteries and stamp out growing corruption as you uncover more about the malevolent cult plaguing the town.
                  </p>
                </div>
              </a>
            </div>

            {/* Baldur's Gate: Descent into Avernus */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/baldurs-gate-descent-into-avernus" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/10691ec3-f311-46ad-a187-46450f9c520f")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Baldur's Gate: Descent into Avernus
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Welcome to Baldur's Gate, a city of ambition and corruption situated at the crossroads of the Sword Coast. You've just started your adventuring career, but already find yourself embroiled in a plot that sprawls from the shadows of Baldur's Gate to the front lines of the planes-spanning Blood War!
                  </p>
                </div>
              </a>
            </div>

            {/* Vampire: The Masquerade 5th Edition */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/vampire-the-masquerade-5th-edition" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/93b152b8-799b-44ee-a30e-e1246c7f5692")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Vampire: The Masquerade 5th Edition
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Vampire: The Masquerade presents a more dramatic, personal horror experience than typical tabletop RPGs. You are a vampire, struggling to survive in a modern world that doesn't know your kind exists.
                  </p>
                </div>
              </a>
            </div>

            {/* Icewind Dale: Rime of the Frostmaiden */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/icewind-dale-rime-of-the-frostmaiden" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/e89f6382-2800-4dad-98bc-b40063168c08")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Icewind Dale: Rime of the Frostmaiden
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    North of the Spine of the World and west of the towering Reghed Glacier is a frigid expanse few dare to explore, let alone inhabit. For two long years, the god of winter's wrath has kept the sun from rising in Icewind Dale.
                  </p>
                </div>
              </a>
            </div>

            {/* Waterdeep: Dragon Heist */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/waterdeep-dragon-heist" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/6268c712-8453-4f3b-9520-8e0a10714647")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Waterdeep: Dragon Heist
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Welcome to Waterdeep, the Crown of the North, where a wondrous tale of urban adventure is about to unfold. Adventurers gather at the Yawning Portal Inn and Tavern. Volothamp Geddarm, the famous explorer, has a quest for them.
                  </p>
                </div>
              </a>
            </div>

            {/* The Wild Beyond the Witchlight */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/the-wild-beyond-the-witchlight" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/697784e6-c557-4c82-ab98-dd059eef53f3")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    The Wild Beyond the Witchlight
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Pass through the silvery mist and into the Feywild—a place of wonder and whimsy ruled by unfettered emotion. With strange customs, fantastical creatures, uncanny bends in time and space, and colorful characters as capricious as they are charming.
                  </p>
                </div>
              </a>
            </div>

            {/* Keys from the Golden Vault */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/keys-from-the-golden-vault" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/7fd8d6c6-e477-4737-a7c5-478b4aeec8de")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Keys from the Golden Vault
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Risk it all for the thrill of pulling off the perfect heist. Keys from the Golden Vault contains thirteen exhilarating heist-themed adventures in which characters take on missions from a mysterious organization known as the Golden Vault.
                  </p>
                </div>
              </a>
            </div>

            {/* Tomb of Annihilation */}
            <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200">
              <a href="/play/dungeons-and-dragons-5e/tomb-of-annihilation" className="block">
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: 'url("https://spg-images.s3.us-west-1.amazonaws.com/d6b2ce8d-7d75-4a26-a5c4-a66fbd09db01")' }}
                ></div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px' }}>
                    Tomb of Annihilation
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed" style={{ fontSize: '12px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    The talk of the streets and taverns has all been about the so-called death curse: a wasting disease afflicting everyone who's ever been raised from the dead. Victims grow thinner and weaker each day, slowly but steadily sliding toward the death they once denied.
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Browse All Adventures
            </button>
          </div>
        </div>
      </section>

      {/* Our Benefits Section */}
      <section className="bg-white" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-slate-900 mb-12" style={{ fontSize: '30px' }}>
            Our Benefits
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {/* Never played before? */}
            <div className="flex flex-col items-start">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V4C20 4 19 5 16 5C13 5 11 3 8 3C5 3 4 4 4 4M4 22L4 2"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3" style={{ fontSize: '18px' }}>
                  Never played before?
                </h3>
                <p className="text-slate-600 leading-relaxed" style={{ fontSize: '16px' }}>
                  If you're new to Dungeons & Dragons and other RPGs, our experienced professional Dungeon Masters and Game Masters are happy to introduce you to the game so you and your friends can learn to play D&D online.
                </p>
              </div>
            </div>

            {/* How much does it cost? */}
            <div className="flex flex-col items-start">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M8.5 14.6667C8.5 15.9553 9.54467 17 10.8333 17H13C14.3807 17 15.5 15.8807 15.5 14.5C15.5 13.1193 14.3807 12 13 12H11C9.61929 12 8.5 10.8807 8.5 9.5C8.5 8.11929 9.61929 7 11 7H13.1667C14.4553 7 15.5 8.04467 15.5 9.33333M12 5.5V7M12 17V18.5M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3" style={{ fontSize: '18px' }}>
                  How much does it cost?
                </h3>
                <p className="text-slate-600 leading-relaxed" style={{ fontSize: '16px' }}>
                  That depends, each GM lists their own price. You can view each game's price when browsing games.
                </p>
              </div>
            </div>

            {/* What are the Games like? */}
            <div className="flex flex-col items-start">
              <div className="mb-4">
                <svg className="text-blue-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.60001 7.1999L12 2.3999M3.60001 7.1999V16.7999M3.60001 7.1999L8.40001 9.5999M12 2.3999L20.4 7.1999M12 2.3999L8.40001 9.5999M12 2.3999L15.6 9.5999M20.4 7.1999V16.7999M20.4 7.1999L15.6 9.5999M20.4 16.7999L12 22.1999M20.4 16.7999L15.6 9.5999M20.4 16.7999L12 17.3999M12 22.1999L3.60001 16.7999M12 22.1999V17.3999M3.60001 16.7999L8.40001 9.5999M3.60001 16.7999L12 17.3999M8.40001 9.5999H15.6M8.40001 9.5999L12 17.3999M15.6 9.5999L12 17.3999" stroke="inherit" strokeWidth="inherit" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3" style={{ fontSize: '18px' }}>
                  What are the Games like?
                </h3>
                <p className="text-slate-600 leading-relaxed" style={{ fontSize: '16px' }}>
                  Love combat? Enjoy roleplaying? Excited by puzzles? Our Game Masters offer games of all play styles. StartPlaying makes it easy to find a D&D group that matches your play style.
                </p>
              </div>
            </div>

            {/* Where do I play? */}
            <div className="flex flex-col items-start">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M9 18L2 22V6L9 2M9 18L16 22M9 18V2M16 22L22 18V2L16 6M16 22V6M16 6L9 2"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3" style={{ fontSize: '18px' }}>
                  Where do I play?
                </h3>
                <p className="text-slate-600 leading-relaxed" style={{ fontSize: '16px' }}>
                  Currently, all of our games are online, but eventually, we will support finding local D&D games and other TTRPGs near you as well. If you're looking to play D&D online we have over 1000 professional dungeon masters ready to run your adventure.
                </p>
              </div>
            </div>

            {/* Hosting a team event? */}
            <div className="flex flex-col items-start">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3" style={{ fontSize: '18px' }}>
                  Hosting a team event?
                </h3>
                <p className="text-slate-600 leading-relaxed" style={{ fontSize: '16px' }}>
                  We've run team events for some of the coolest companies in the world! Check out our{" "}
                  <a href="/corporate-games" className="text-blue-600 hover:text-blue-700 underline">
                    corporate games page
                  </a>
                  {" "}and book an event for your team!
                </p>
              </div>
            </div>

            {/* What if I don't have a group? */}
            <div className="flex flex-col items-start">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                  <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3" style={{ fontSize: '18px' }}>
                  What if I don't have a group?
                </h3>
                <p className="text-slate-600 leading-relaxed" style={{ fontSize: '16px' }}>
                  No worries, join a game solo and play with other players! StartPlaying is the largest RPG table finder for games run by professional dungeon masters and game masters. Over 20,000 players have found their online D&D group with us. Whether you wanna play D&D online with a pro-GM, or any other TTRPG, StartPlaying has you covered.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
