import React from 'react';

const GenresPage: React.FC = () => {
  const genres = [
    {
      id: 'fantasy',
      name: 'Fantasy',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/aa83b2a5-af63-4fd4-bda9-565abcd4b833'
    },
    {
      id: 'high-fantasy',
      name: 'High Fantasy',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/8163e106-5015-4fea-b95d-02ea20b69d86'
    },
    {
      id: 'mystery',
      name: 'Mystery',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/92e901c0-bde7-49ab-bd92-6bce303a2c34'
    },
    {
      id: 'imaginative',
      name: 'Imaginative',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/9863f861-b900-4551-8cfe-b2274e24378e'
    },
    {
      id: 'horror',
      name: 'Horror',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/521dce30-5aa5-405e-93b0-30a8034b6d50'
    },
    {
      id: 'gritty-fantasy',
      name: 'Gritty Fantasy',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/166217be-7ea3-43a6-a988-196b82b75a98'
    },
    {
      id: 'supernatural',
      name: 'Supernatural',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/b321afc8-6262-4816-aadc-c5c8be620741'
    },
    {
      id: 'survival',
      name: 'Survival',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/f2c9173d-1aac-428c-90a0-31112300a090'
    },
    {
      id: 'gothic-horror',
      name: 'Gothic Horror',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/c489696a-2d32-4d83-8a38-a7eb40740e3c'
    },
    {
      id: 'wacky',
      name: 'Wacky',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/43223257-6769-4361-8397-b1693aa48331'
    },
    {
      id: 'scifi',
      name: 'Sci-fi',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/57746d55-4e6d-486d-bdb7-4284ba4918c7'
    },
    {
      id: 'comedy',
      name: 'Comedy',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/6b196847-8249-475f-b14f-6383a5b517b4'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/be3029af-ef12-4734-afbf-1551ad5738f0'
    },
    {
      id: 'dark-fantasy',
      name: 'Dark Fantasy',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/4aada792-f035-4400-9f29-5d5bc5b3b1ee'
    },
    {
      id: 'pirate',
      name: 'Pirate',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/9b2bc16c-c2b4-4cbd-b669-377ae8922b3a'
    },
    {
      id: 'eldritch-horror',
      name: 'Eldritch Horror',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/ed2de55d-6bc4-43c9-9552-6131794b5cfe'
    },
    {
      id: 'futuristic',
      name: 'Futuristic',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/dd564e80-c756-48b4-b996-167370891ff3'
    },
    {
      id: 'historical',
      name: 'Historical',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/1afc9d39-8a11-4f23-9f18-4b5691ad15ab'
    },
    {
      id: 'low-magic',
      name: 'Low Magic',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/2f3ccaf7-bc2d-4e95-9d23-dd8a738e5b06'
    },
    {
      id: 'grimdark',
      name: 'Grimdark',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/f499e049-5f79-45b2-8514-dec4ee385ddf'
    },
    {
      id: 'political-intrigue',
      name: 'Political Intrigue',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/9bbb397a-4723-46fc-ac55-64e1da9bb8b4'
    },
    {
      id: 'space-opera',
      name: 'Space Opera',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/da6b6b25-b351-40aa-b01a-9d9690a52664'
    },
    {
      id: 'post-apocalyptic',
      name: 'Post-Apocalyptic',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/3136b855-7f6e-48e5-bdbe-3c3420e8f706'
    },
    {
      id: 'steampunk',
      name: 'Steampunk',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/9e61e164-5b00-40da-b373-f5de0895327e'
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/8e24fd92-76cd-4226-8fe6-7aaa6959ac8d'
    },
    {
      id: 'urban-fantasy',
      name: 'Urban Fantasy',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/b42c96f6-92bd-429b-89d7-9b28218217f2'
    },
    {
      id: 'super-heroes',
      name: 'Superhero',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/fc381f71-fd86-4be6-921d-d455975b33eb'
    },
    {
      id: 'espionage',
      name: 'Espionage',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/ef9d958e-260a-4da3-9082-b774ca547763'
    },
    {
      id: 'cozy',
      name: 'Cozy',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/cdcf0fa5-a029-4117-861e-987f3e70634c'
    },
    {
      id: 'heartwarming',
      name: 'Heartwarming',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/7b29a0e1-5589-4ba0-800f-f384459d2586'
    },
    {
      id: 'space-western',
      name: 'Space Western',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/7234ffb7-4b09-4995-8b0e-02100c1efcc9'
    },
    {
      id: 'anime',
      name: 'Anime',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/ea9d4865-55ea-4d4a-82a1-4955838e76cc'
    },
    {
      id: 'battle-royale',
      name: 'Battle Royale',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/53532353-f3c0-4fd0-a4de-1cc8d0a5ad43'
    },
    {
      id: 'western',
      name: 'Western',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/169e0bf8-fe65-4e7a-b36a-f9d9dee7a27d'
    },
    {
      id: 'rustic',
      name: 'Rustic',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/f8bb6568-213e-42f4-8e21-d5d5a44f83d9'
    },
    {
      id: 'viking',
      name: 'Viking',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/9d99d531-683f-449c-8eb2-1cf34d121e1e'
    },
    {
      id: 'romance',
      name: 'Romance',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/13523576-9e11-44a8-8885-f8f819ac071d'
    },
    {
      id: 'universal',
      name: 'Universal',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/0c263a00-1157-4a43-b0bf-a88791804136'
    },
    {
      id: 'isekai',
      name: 'Isekai',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/5efcb36c-cf5d-49f9-a3a6-09edaa244f9e'
    },
    {
      id: 'victorian',
      name: 'Victorian',
      description: '',
      image: 'https://spg-images.s3.us-west-1.amazonaws.com/6c9e8172-2377-4b0d-b880-00136b191d35'
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
              src="/images/genres-desktop.webp" 
              alt="Genres"
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
              Genres
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
                Not sure what you want to play, but you know it needs to involve Pirates? Looking for something spooky? Maybe you just want to find that perfect cozy fantasy game or a battle royal TTRPG. Browse all tabletop roleplaying games on StartPlaying by genre. Everything from Sci-fi to Westerns. Find the perfect game and start playing today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse popular genres & themes */}
      <section className="bg-white" style={{ paddingTop: '55px', paddingBottom: '64px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingLeft: '62px' }}>
          <h2 className="font-bold text-slate-900 mb-4" style={{ fontSize: '30px', fontFamily: 'Inter, sans-serif' }}>Browse popular genres & themes</h2>
          <p className="text-slate-500 mb-8" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
            Not sure what you want to play, but you know it needs to involve Pirates? Looking for something spooky? Maybe you just want to find that perfect cozy fantasy game or a battle royal TTRPG. Browse all tabletop roleplaying games on StartPlaying by genre. Everything from Sci-fi to Westerns. Find the perfect game and start playing today.
          </p>

          {/* Genres Grid */}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center">
              {genres.map((genre) => (
              <div 
                key={genre.id} 
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer border border-gray-200"
                style={{ width: '212px', height: '430px' }}
              >
                <a href={`/play/${genre.id}`} className="block h-full">
                  <div 
                    className="bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url(${genre.image})`,
                      height: '310px',
                      width: '212px'
                    }}
                  />
                  <div className="p-4" style={{ height: '120px' }}>
                    <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontSize: '16px', fontFamily: 'Inter, sans-serif' }}>
                      {genre.name}
                    </h3>
                    <p className="text-slate-600 leading-relaxed" style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {genre.description}
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

export default GenresPage;