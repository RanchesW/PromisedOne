import React from 'react';

const MechanicsPage: React.FC = () => {
  const mechanics = [
    {
      id: 'd20-system',
      name: 'd20 System'
    },
    {
      id: 'dice-pool-system',
      name: 'Dice Pool System'
    },
    {
      id: 'powered-by-the-apocalypse',
      name: 'Powered by the Apocalypse'
    },
    {
      id: 'basic-roleplaying-universal-game-engine',
      name: 'Basic Roleplaying: Universal Game Engine'
    },
    {
      id: 'osr',
      name: 'OSR'
    },
    {
      id: 'exploding-dice',
      name: 'Exploding Dice'
    },
    {
      id: 'storyteller-system',
      name: 'Storyteller System'
    },
    {
      id: 'year-zero-engine',
      name: 'Year Zero Engine'
    },
    {
      id: 'interlock-system',
      name: 'Interlock System'
    },
    {
      id: '2d20-system',
      name: '2d20 System'
    },
    {
      id: 'forged-in-the-dark',
      name: 'Forged in the Dark'
    },
    {
      id: 'narrative-dice-system',
      name: 'Narrative Dice System'
    },
    {
      id: 'd616-role-playing-system',
      name: 'd616 Role-Playing System'
    },
    {
      id: 'powered-by-mork-borg',
      name: 'Powered by Mörk Borg'
    },
    {
      id: 'illuminated-worlds-system',
      name: 'Illuminated Worlds System'
    },
    {
      id: 'fudge-system',
      name: 'Fudge System'
    },
    {
      id: 'essence20-system',
      name: 'Essence20 System'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-white" style={{ paddingTop: '64px', paddingBottom: '0px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="bg-white rounded-lg border border-gray-200 relative"
            style={{ width: '1125px', height: '510px', margin: '0 auto' }}
          >
            {/* Image positioned in upper left corner */}
            <img 
              src="/images/mechanics-desktop.webp" 
              alt="Mechanics"
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
              Mechanics
              </h1>
            </div>
            
            {/* Separation line */}
            <div 
              className="absolute"
              style={{ left: '0px', right: '0px', top: '344px' }}
            >
              <hr className="border-gray-200" />
            </div>
            
            {/* Description text below image */}
            <div 
              className="absolute"
              style={{ left: '40px', top: '365px', right: '40px' }}
            >
              <p className="text-base text-slate-500 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                Looking for a tabletop RPG that fits your playstyle? Browse TTRPGs organized by game mechanics—from d20 systems and dice pools to narrative-focused rulesets and unique storytelling engines. If you love Monster of the Week, browse other games that use the Powered by the Apocalypse system. Whether you prefer tactical combat, collaborative storytelling, or lightweight rules, you can find the games that match how you love to play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse popular mechanics */}
      <section className="bg-white" style={{ paddingTop: '55px', paddingBottom: '64px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingLeft: '50px' }}>
          <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: '30px', fontFamily: 'Inter, sans-serif' }}>Browse popular mechanics</h2>

          {/* Mechanics Grid */}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {mechanics.map((mechanic) => (
              <div 
                key={mechanic.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200"
                style={{ minWidth: '212px', height: '60px' }}
              >
                <a href={`/play/${mechanic.id}`} className="block h-full p-4">
                  <div className="h-full flex items-center justify-center text-center">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                      {mechanic.name}
                    </h3>
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

export default MechanicsPage;