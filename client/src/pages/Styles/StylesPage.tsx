import React from 'react';

const StylesPage: React.FC = () => {
  const styles = [
    {
      id: 'roleplay-heavy',
      name: 'Roleplay Heavy',
      description: '"Roleplay Heavy" games place the focus on the story, the characters, and the world they live within, and tend to lean hard into the various roleplaying elements of the game. These games will frequently find the party talking with NPCs, exploring the personal elements of their backstories, or even having emotional moments around the camp fire.'
    },
    {
      id: 'rule-of-cool',
      name: 'Rule of Cool (RoC)',
      description: '"Rule of Cool" emphasizes creative story beats over sticking to a system\'s rules as written. Players have the ability to push the limits of the rules or even break core rule mechanics at times if the Game Master thinks it is interesting, fun, or cool enough.'
    },
    {
      id: 'theater-of-the-mind',
      name: 'Theater of the Mind',
      description: '"Theater of the Mind" uses little to no visuals for scene settings and combat. Instead, the narrative imagery comes from the Game Master\'s descriptions and character action and movement comes from Players\' descriptions.'
    },
    {
      id: 'combat-heavy',
      name: 'Combat Heavy',
      description: '"Combat Heavy" games emphasize the combat mechanics within their systems over roleplay or puzzle solving. There are frequent and longer battles with enemies and a greater emphasis on tactical game play.'
    },
    {
      id: 'sandbox-open-world',
      name: 'Sandbox / Open World',
      description: 'In "Sandbox" or "Open World" games, players are given a tremendous amount of freedom to pursue their stories without the restrictions of a more linear game style. Players are encouraged to explore and engage with the world, and find their own story as they do so. These games offer the players the opportunity to help drive the narrative, and allow for the story to evolve organically through the choices they make.'
    },
    {
      id: 'rules-as-written',
      name: 'Rules as Written (RaW)',
      description: 'Games that are ran "Rules as Written" emphasize realism and stick to the letter of the rules, allowing players to explore creative solutions while still operating under a consistent rule set. Players have the ability to utilize the rules in creative ways to create awesome characters and moments in the game.'
    },
    {
      id: 'dungeon-crawl',
      name: 'Dungeon Crawl',
      description: 'A "Dungeon Crawl" is a scenario where players navigate a dungeon or labyrinth-like environment for the entirety of the adventure. It emphasizes battling monsters, collecting loot, and avoiding traps to survive to the end!'
    },
    {
      id: 'play-by-post',
      name: 'Play By Post',
      description: 'Play By Post refers to a game in which players interact with the story through messages and text posts. These games are typically played asynchronously throughout the week, which gives players time to consider what they want to do next, and engage with the story at their own pace.'
    },
    {
      id: 'organized-play',
      name: 'Organized Play',
      description: 'Organized Play uses a standardized ruleset for character creation, leveling, and rewards. Every character plays by the same rules. Its strength is flexibility: bring your character to any table and jump right in. With tight rule adherence, every game feels consistent, fair, and ready for adventure.'
    },
    {
      id: 'west-marches',
      name: 'West Marches',
      description: 'West Marches games are typically ran as "drop-in / drop-out" campaigns, where a pool of players hop into sessions as they are available or as sessions align with their schedules. These games focus on a player-led story and exploration, with each session acting as a self contained adventure, allowing for players to experience a variety of stories within an overarching campaign.'
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
              src="/images/styles-desktop.webp" 
              alt="Styles"
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
              Styles
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
              style={{ left: '40px', top: '365px', right: '40px' }}
            >
              <p className="text-base text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Browse games by your favorite playstyles. Are you seeking a roleplay heavy adventure? Looking for treasure in a Dungeon Crawl? Search through everything from play by post games to organized play. Find all the different game styles that suit the way you want to play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Popular styles */}
      <section className="bg-white" style={{ paddingTop: '55px', paddingBottom: '64px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingLeft: '55px' }}>
          <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: '30px', fontFamily: 'Inter, sans-serif' }}>Browse Popular styles</h2>

          {/* Styles Grid */}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {styles.map((style) => (
              <div 
                key={style.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200"
                style={{ minWidth: '212px', minHeight: '150px' }}
              >
                <a href={`/play/${style.id}`} className="block h-full p-4">
                  <div className="h-full flex flex-col text-center">
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                      {style.name}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm flex-1" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' }}>
                      {style.description}
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

export default StylesPage;