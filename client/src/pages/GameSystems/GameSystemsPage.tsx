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
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="bg-white rounded-lg border border-gray-200 relative"
            style={{ width: '1125px', height: '460px', margin: '0 auto' }}
          >
            {/* Image positioned in upper left corner */}
            <img 
              src="/images/game-systems-desktop.webp" 
              alt="Game Systems"
              className="absolute top-0 left-0"
              style={{ 
                width: '320px', 
                height: '344px',
                objectFit: 'contain',
                margin: '0px 0 0 0px'
              }}
            />
            
            {/* Title positioned middle-right of image */}
            <div 
              className="absolute"
              style={{ left: '380px', top: '155px' }}
            >
              <h1 className="text-5xl font-bold text-slate-900">
              Game Systems
              </h1>
            </div>
            
            {/* Separation line */}
            <div 
              className="absolute"
              style={{ left: '0px', right: '0px', top: '343px' }}
            >
              <hr className="border-gray-200" />
            </div>
            
            {/* Description text below image */}
            <div 
              className="absolute"
              style={{ left: '40px', top: '380px', right: '40px' }}
            >
              <p className="text-base text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Browse all tabletop roleplaying games on KazRPG. Are you searching for your next game of 5e D&D? Looking to face off against eldritch horrors in Call of Cthulhu? Find popular tabletop roleplaying game systems from Pathfinder, Lancer, City of Mist, and more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Popular TTRPG Game Systems */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingLeft: '95px' }}>
          <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: '30px', fontFamily: 'Inter, sans-serif' }}>Browse Popular TTRPG Game Systems</h2>
          <p className="text-slate-500 mb-8" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
            Browse 100's of tabletop roleplaying games run by professional Dungeon Masters. Find your favorite TTRPG system and start playing online today!
          </p>

          {/* Game Systems Grid */}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center">
              {gameSystems.map((system) => (
              <div 
                key={system.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200"
                style={{ width: '212px', height: '430px' }}
              >
                <a href={`/play/${system.id}`} className="block h-full">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${system.image})`,
                      height: '310px',
                      width: '212px'
                    }}
                  />
                  <div className="p-4" style={{ height: '120px' }}>
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                      {system.name}
                    </h3>
                    <p className="text-slate-600 leading-relaxed" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {system.description}
                    </p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GameSystemsPage;
