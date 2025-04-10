// strain-scanner/pages/index.tsx
import { useState, useEffect } from 'react';
import strains from '../data/leafly_strain_data.json';

interface Strain {
  name: string;
  type: string;
  effects?: string[];
  flavors?: string[];
  description?: string;
}

export default function Home() {
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
    const matches = strains.filter((strain: Strain) =>
      strain.name.toLowerCase().includes(query.toLowerCase()) ||
      strain.flavors?.some(flavor => flavor.toLowerCase().includes(query.toLowerCase()))
    );
    setResults(matches.slice(0, 5));
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
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">🌿 Plant Scanner Demo</h1>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImage}
        className="border p-2 rounded"
      />

      {image && <img src={image} alt="Plant" className="w-full rounded shadow" />}

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Enter strain name or flavor"
        className="border p-2 w-full rounded"
      />
      <button onClick={handleSearch} className="bg-green-600 text-white px-4 py-2 rounded">
        Search
      </button>

      <div className="space-y-4">
        {results.map((strain) => (
          <div key={strain.name} className="border p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{strain.name}</h2>
              <button onClick={() => toggleFavorite(strain.name)}>
                {favorites.includes(strain.name) ? '💚' : '🤍'}
              </button>
            </div>
            <p className="text-sm text-gray-500">{strain.type}</p>
            <p><strong>Flavors:</strong> {strain.flavors?.join(', ')}</p>
            <p><strong>Effects:</strong> {strain.effects?.join(', ')}</p>
            <p className="text-sm italic">{strain.description?.slice(0, 120)}...</p>

            <div className="mt-2">
              <label className="block text-sm font-medium">Your Comment:</label>
              <textarea
                value={comments[strain.name] || ''}
                onChange={(e) => handleComment(strain.name, e.target.value)}
                className="w-full border rounded p-1"
              />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium">Your Rating:</label>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => handleRating(strain.name, n)}
                  className={ratings[strain.name] >= n ? 'text-yellow-500' : 'text-gray-400'}>
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
