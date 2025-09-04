import React from 'react';

const GameSystemsPage: React.FC = () => {
  const gameSystems = [
    {
      id: 'dungeons-and-dragons-5e',
      name: 'Dungeons & Dragons 5e',
      description: "As the world's most popular roleplaying game, Dungeons & Dragons 5e has introduced millions of players to the world of fantasy roleplaying. Fight monsters, win treasure, and become the most powerful heroes in the world!",
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/fd33bd25-5d68-423f-99ec-896c6b215c7a'
    },
    {
      id: 'pathfinder-2e',
      name: 'Pathfinder 2e',
      description: 'Pathfinder 2nd Edition updates the beloved maximalist fantasy RPG Pathfinder with an improved action economy, even more character options, and newly organized rules.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/aa644cc9-cd67-4b00-8fcd-6eb35963461e'
    },
    {
      id: 'daggerheart',
      name: 'Daggerheart',
      description: 'Daggerheart is a fantasy tabletop roleplaying game of brave heroics and vibrant worlds that are built together with your gaming group. Create a shared story with your adventuring party, and shape your world through rich, long-term campaign play.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/bcaf7f0d-72eb-4975-b663-dd9e22eee7a2'
    },
    {
      id: 'call-of-cthulhu',
      name: 'Call of Cthulhu',
      description: 'The original RPG of eldritch horror sets your team of intrepid investigators against the monsters and madness of the Cthulhu mythos, seeking truths that threaten to shatter humanity\'s fragile minds.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/16b52538-a31d-49d8-8824-1356a9c64085'
    },
    {
      id: 'vampire-the-masquerade-5e',
      name: 'Vampire: The Masquerade 5th Edition',
      description: 'Vampire: The Masquerade presents a more dramatic, contemplative world than most tabletop roleplaying games (TTRPGs). While the average TTRPG experience is a Dungeons & Dragons inspired one (fighting monsters and getting treasure), Vampire is about simply surviving and keeping a piece of yourself intact.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/136fcd6f-8e42-4d1b-814a-7f2f14a47112'
    },
    {
      id: 'pathfinder-1e',
      name: 'Pathfinder 1e',
      description: 'Pathfinder\'s 1st edition carries the legacy of maximalist roleplaying, with abundant character options, a rule for anything you can imagine, and a deep, complex game system with lots of interlocking parts!',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/3a8c0135-4ac9-4b1c-ba28-4374c141e1e1'
    },
    {
      id: 'monster-of-the-week',
      name: 'Monster of the Week',
      description: 'Investigate supernatural mysteries, protect clueless civilians, and kick monster ass in this narrative-focused game of monster-hunting horror!',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/7aeee015-bd68-47c8-bfa1-3223fa4d3f7a'
    },
    {
      id: 'cyberpunk-red',
      name: 'Cyberpunk Red',
      description: 'The year is 2045. Megacorporations, gangs, and politicians carve up the neon sprawl of Night City. You\'re a cyberpunk—a biohacked, cybernetic deniable asset living on the edge of society. Do you have what it takes to claim a piece of it for yourself?',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/722b6bfb-27ea-447b-9a0e-3e75623435ba'
    },
    {
      id: 'shadowdark-rpg',
      name: 'Shadowdark RPG',
      description: 'Shadowdark is old-school sword-and-sorcery dungeon delving with modern sensibilities. A slick, intuitive, and dark game of monster slaying, treasure hunting, and dungeon survival horror.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/ad9bf202-8c9a-4d3e-bd98-bc19270455a3'
    },
    {
      id: 'lancer',
      name: 'Lancer',
      description: 'You are a Lancer, an elite mech pilot fighting for the future of Union! Set thousands of years in the future, Lancer is a tactical combat RPG of giant fighting robots.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/399cdbe5-8b0d-42b8-9e56-400e46bff263'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 rounded-lg flex items-center" style={{ height: '618px' }}>
            <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '388px', height: '462px' }}>
              <img 
                src="/images/game-systems-circle-desktop.webp" 
                alt="Game Systems"
                className="object-contain"
                style={{ width: '300px', height: '300px' }}
              />
            </div>
            <div className="flex-1 px-12 py-8">
              <h1 className="text-6xl font-bold text-slate-900 mb-8">Game Systems</h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Browse all tabletop roleplaying games on StartPlaying. Are you searching for your next game of 5e D&D? Looking to face off against eldritch horrors in Call of Cthulhu? Find popular tabletop roleplaying game systems from Pathfinder, Lancer, City of Mist, and more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Popular TTRPG Game Systems */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Browse Popular TTRPG Game Systems</h2>
          <p className="text-lg text-slate-500 mb-12">
            Browse 100's of tabletop roleplaying games run by professional Dungeon Masters. Find your favorite TTRPG system and start playing online today!
          </p>

          {/* Masonry-style Grid like StartPlaying */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {/* D&D 5e - Large card (390px × 429px from reference) */}
            <div className="break-inside-avoid mb-6">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/dungeons-and-dragons-5e" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[0].image})`, 
                      width: '100%',
                      aspectRatio: '390/214'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {gameSystems[0].name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      As the world's most popular roleplaying game, Dungeons & Dragons leads the way in RPG enjoyment.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Pathfinder 2e - Wide card (604px × 429px from reference) */}
            <div className="break-inside-avoid mb-6">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/pathfinder-2e" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[1].image})`, 
                      width: '100%',
                      aspectRatio: '604/214'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {gameSystems[1].name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Pathfinder 2nd Edition updates the beloved maximalist fantasy RPG for a new generation.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Daggerheart - Extra wide card (1130px × 254px from reference) */}
            <div className="break-inside-avoid mb-6 lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/daggerheart" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[2].image})`, 
                      width: '100%',
                      aspectRatio: '1130/214'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {gameSystems[2].name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Daggerheart is a fantasy tabletop roleplaying game of brave heroics and vibrant worlds.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Call of Cthulhu - Medium card (1518px × 688px from reference) */}
            <div className="break-inside-avoid mb-6">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/call-of-cthulhu" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[3].image})`, 
                      width: '100%',
                      aspectRatio: '390/180'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {gameSystems[3].name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      The original RPG of eldritch horror sets your team of investigators against cosmic terror.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Vampire - Tall card (1518px × 688px from reference) */}
            <div className="break-inside-avoid mb-6">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/vampire-the-masquerade-5e" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[4].image})`, 
                      width: '100%',
                      aspectRatio: '390/300'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      Vampire: The Masquerade 5th Edition
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Vampire: The Masquerade presents a more dramatic, personal, and political take on vampires.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Monster of the Week - Square card (683px × 616px from reference) */}
            <div className="break-inside-avoid mb-6">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/monster-of-the-week" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[6].image})`, 
                      width: '100%',
                      aspectRatio: '390/350'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {gameSystems[6].name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Hunt monsters in the modern world with this Powered by the Apocalypse system.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Cyberpunk Red - Medium card (390px × 254px from reference) */}
            <div className="break-inside-avoid mb-6">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/cyberpunk-red" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[7].image})`, 
                      width: '100%',
                      aspectRatio: '390/180'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {gameSystems[7].name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      The latest edition of the classic cyberpunk RPG in the dark future of 2045.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Shadowdark RPG */}
            <div className="break-inside-avoid mb-6">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/shadowdark-rpg" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[8].image})`, 
                      width: '100%',
                      aspectRatio: '390/214'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {gameSystems[8].name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Old-school sword-and-sorcery dungeon delving with modern sensibilities.
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Lancer */}
            <div className="break-inside-avoid mb-6">
              <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
                <a href="/play/lancer" className="block">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${gameSystems[9].image})`, 
                      width: '100%',
                      aspectRatio: '390/214'
                    }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {gameSystems[9].name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Elite mech pilot fighting for the future of Union in tactical combat RPG.
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GameSystemsPage;
