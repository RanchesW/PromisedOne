import React from 'react';

const PlatformsPage: React.FC = () => {
  const platforms = [
    {
      id: 'discord',
      name: 'Discord',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/c69392c0-aff2-424e-8597-352feda1e0b2'
    },
    {
      id: 'roll20',
      name: 'Roll20',
      description: 'Roll20 is one of the largest and most popular virtual tabletops, with a vast community and a huge number of supported systems.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/344440ab-ea80-4100-8d43-d13b66a7f8e3'
    },
    {
      id: 'dd-beyond',
      name: 'D&D Beyond',
      description: 'D&D Beyond is the official digital companion platform for Dungeons & Dragons 5th Edition. It offers character building and management tools, content collection, navigation, and organization, and a suite of virtual tabletop tools like encounter builders, and maps in both 2D and 3D.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/67c409cd-5f9b-4738-af1d-2a751b36e074'
    },
    {
      id: 'foundry-vtt',
      name: 'Foundry VTT',
      description: 'Foundry VTT is a highly customizable virtual tabletop platform with loads of features, an active community of creators, and tons of officially supported systems.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/9ef76006-306d-4782-b490-2f3a1bc24f2d'
    },
    {
      id: 'owlbear-rodeo',
      name: 'Owlbear Rodeo',
      description: 'Owlbear Rodeo is a stripped-down virtual tabletop built to explore maps, run encounters, and roll dice. It\'s supported by both its developers and a vibrant community of creators of expansions and mods.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/6d94c7cc-0ae9-4dfb-b5fc-7e82896a4f18'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/79153c6c-c00e-4a36-bad6-dab641cb8d39'
    },
    {
      id: 'dd-beyond-maps',
      name: 'D&D Beyond Maps',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/290d1c88-567f-457d-8d02-5f3759c3949d'
    },
    {
      id: 'demiplane',
      name: 'Demiplane',
      description: 'Demiplane is an online toolset of tabletop roleplaying game rules and character sheets. It\'s a virtual library where players can quickly and easily reference books and create characters in several supported games.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/07beb8cb-8cee-4eeb-9006-8b3f7b82e7c6'
    },
    {
      id: 'fantasy-grounds',
      name: 'Fantasy Grounds',
      description: 'Fantasy Grounds is a feature-rich virtual tabletop program with a vast library of supported games and supplements. It\'s well-known for its robust toolsets and high level of customizability.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/ca0ea792-e3cf-49c5-abf2-7290e64ebb14'
    },
    {
      id: 'tale-spire',
      name: 'TaleSpire',
      description: 'TaleSpire is a 3D virtual tabletop for grid-based roleplaying games. Game masters can construct maps and environments for players to explore, complete with lighting, music, digital minis and dice.',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/a6625da9-3857-47aa-a729-5e3e1332464a'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-white" style={{ paddingTop: '64px', paddingBottom: '0px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="bg-white rounded-lg border border-gray-200 relative"
            style={{ width: '1125px', height: '460px', margin: '0 auto' }}
          >
            {/* Image positioned in upper left corner */}
            <img 
              src="/images/platforms-desktop.webp" 
              alt="Platforms"
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
              Platforms
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
                Browse games by your favorite virtual tabletops and platforms. Find games on Discord, Foundry VTT, Roll20, Owlbear Rodeo, Fantasy Grounds, Alchemy RPG and more!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Popular platforms */}
      <section className="bg-white" style={{ paddingTop: '55px', paddingBottom: '64px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingLeft: '55px' }}>
          <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: '30px', fontFamily: 'Inter, sans-serif' }}>Browse Popular platforms</h2>

          {/* platforms Grid */}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center">
              {platforms.map((platform) => (
              <div 
                key={platform.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200"
                style={{ width: '212px', height: '430px' }}
              >
                <a href={`/play/${platform.id}`} className="block h-full">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${platform.image})`,
                      height: '310px',
                      width: '212px'
                    }}
                  />
                  <div className="p-4" style={{ height: '120px' }}>
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                      {platform.name}
                    </h3>
                    <p className="text-slate-600 leading-relaxed" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {platform.description}
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

export default PlatformsPage;