// strain-scanner/pages/index.tsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import { getStrains } from '@/lib/getStrains';
import Image from 'next/image';

interface Strain {
  name: string;
  type: string;
  effects?: { [key: string]: string };
  flavors?: string[];
  description?: string;
}

export const getStaticProps: GetStaticProps = async () => {
  const strains = getStrains();
  return {
    props: {
      strains,
    },
  };
};

export default function Home({ strains }: { strains: Strain[] }) {
  const [image, setImage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Strain[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const favs = localStorage.getItem('favorites');
    const comm = localStorage.getItem('comments');
    const rates = localStorage.getItem('ratings');
    if (favs) setFavorites(JSON.parse(favs));
    if (comm) setComments(JSON.parse(comm));
    if (rates) setRatings(JSON.parse(rates));
  }, []);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    const normalizedQuery = query.toLowerCase();
    const matches = strains.filter((strain) => {
      const nameMatch = strain.name?.toLowerCase().includes(normalizedQuery);
      const flavorMatch = Array.isArray(strain.flavors) && strain.flavors.some((f) => f.toLowerCase().includes(normalizedQuery));
      const descriptionMatch = strain.description?.toLowerCase().includes(normalizedQuery);
      return nameMatch || flavorMatch || descriptionMatch;
    });
    setResults(matches.slice(0, 15));
  };

  const toggleFavorite = (name: string) => {
    const updated = favorites.includes(name)
      ? favorites.filter(f => f !== name)
      : [...favorites, name];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const handleComment = (name: string, comment: string) => {
    const updated = { ...comments, [name]: comment };
    setComments(updated);
    localStorage.setItem('comments', JSON.stringify(updated));
  };

  const handleRating = (name: string, rating: number) => {
    const updated = { ...ratings, [name]: rating };
    setRatings(updated);
    localStorage.setItem('ratings', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white text-gray-800 p-4 space-y-6 max-w-xl mx-auto">
      <Head>
        <title>Strain Scanner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <h1 className="text-3xl font-bold text-center">🌿 Strain Scanner</h1>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImage}
          className="w-full mb-4 text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />

        {image && (
          <Image
            src={image}
            alt="Plant preview"
            width={400}
            height={300}
            className="rounded-xl shadow w-full object-cover mb-4"
          />
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search strain name or flavor..."
          className="w-full border p-2 rounded-md mb-2"
        />
        <button
          onClick={handleSearch}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Search
        </button>
      </div>

      <div className="space-y-4">
        {Array.isArray(results) && results.map((strain, idx) => {
          if (!strain || typeof strain.name !== 'string') {
            return (
              <div key={`invalid-${idx}`} className="bg-red-100 p-4 rounded shadow">
                <p className="text-red-700">⚠️ Invalid strain data</p>
              </div>
            );
          }

          return (
            <div key={strain.name + idx} className="bg-white p-4 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{strain.name}</h2>
                <button onClick={() => toggleFavorite(strain.name)}>
                  {favorites.includes(strain.name) ? '💚' : '🤍'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-1">{strain.type || 'Unknown Type'}</p>
              <p className="text-sm"><strong>Flavors:</strong> {Array.isArray(strain.flavors) ? strain.flavors.join(', ') : 'N/A'}</p>
              <p className="text-sm"><strong>Effects:</strong> {
                strain.effects
                  ? Object.entries(strain.effects).map(([effect, value]) => `${effect} (${value})`).join(', ')
                  : 'N/A'
              }</p>
              <p className="text-sm italic mt-1">{strain.description?.slice(0, 120) || 'No description available.'}</p>

              <textarea
                value={comments[strain.name] || ''}
                onChange={(e) => handleComment(strain.name, e.target.value)}
                placeholder="Write your comment..."
                className="w-full border p-1 rounded text-sm mt-2"
              />

              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleRating(strain.name, n)}
                    className={ratings[strain.name] >= n ? 'text-yellow-500' : 'text-gray-300'}>
                    ★
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
