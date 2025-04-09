import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Facebook, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter'; // Added import

// Intégration directe des albums Facebook publics de La Ride du Sasquatch

import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { FacebookAlbum, FacebookPhoto } from '@shared/schema';

// Local interfaces for backwards compatibility
interface Photo {
  id: string;
  url: string;
  caption?: string;
  created_time: string;
}

interface Album {
  id: string;
  name: string;
  description?: string;
  cover_photo: string;
  facebook_url: string;
  photos: Photo[];
}

// Les albums seront chargés dynamiquement depuis useEffect

const FacebookAlbums = () => {
  // Local state for UI
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [localAlbums, setLocalAlbums] = useState<Album[]>([]);

  // Fetch albums from DB
  const { data: dbAlbums, isLoading: albumsLoading } = useQuery<FacebookAlbum[]>({
    queryKey: ['/api/facebook/albums'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Helper function to map DB albums to our local format
  const mapDbAlbumsToLocal = (albums: FacebookAlbum[]): Album[] => {
    return albums.map(album => ({
      id: album.id.toString(),
      name: album.name,
      description: album.description || undefined,
      cover_photo: album.coverImage,
      facebook_url: album.facebookUrl,
      photos: [] // We'll load photos separately
    }));
  };

  // Fetch photos for an album
  const { data: albumPhotos, isLoading: photosLoading } = useQuery<FacebookPhoto[]>({
    queryKey: ['/api/facebook/albums', selectedAlbumId, 'photos'],
    queryFn: selectedAlbumId && !isNaN(parseInt(selectedAlbumId)) 
      ? getQueryFn({ on401: 'returnNull' }) 
      : () => Promise.resolve([]),
    enabled: !!selectedAlbumId && !isNaN(parseInt(selectedAlbumId))
  });

  // Map FacebookPhoto objects to Photo format if we have them
  useEffect(() => {
    if (albumPhotos && albumPhotos.length > 0 && selectedAlbumId && !isNaN(parseInt(selectedAlbumId))) {
      // Find the current album in our local state
      const albumIndex = localAlbums.findIndex(album => album.id === selectedAlbumId);

      if (albumIndex !== -1) {
        // Create a new array to prevent mutation
        const updatedAlbums = [...localAlbums];

        // Map the DB photos to our local format
        const mappedPhotos: Photo[] = albumPhotos.map(photo => ({
          id: photo.id.toString(),
          url: photo.url, // Use the right property from schema
          caption: photo.caption || undefined,
          created_time: photo.createdAt 
            ? (typeof photo.createdAt === 'string' 
               ? photo.createdAt 
               : photo.createdAt.toISOString())
            : new Date().toISOString()
        }));

        // Update the photos for this album
        updatedAlbums[albumIndex] = {
          ...updatedAlbums[albumIndex],
          photos: mappedPhotos
        };

        // Update our local state
        setLocalAlbums(updatedAlbums);
      }
    }
  }, [albumPhotos, selectedAlbumId]);

  // When dbAlbums change, update our local state
  useEffect(() => {
    if (dbAlbums && dbAlbums.length > 0) {
      const mappedAlbums = mapDbAlbumsToLocal(dbAlbums);
      setLocalAlbums(mappedAlbums);

      if (!selectedAlbumId) {
        setSelectedAlbumId(mappedAlbums[0].id);
      }
    } else if (!dbAlbums && !albumsLoading) {
      // Si les albums ne sont pas disponibles dans la base de données, utiliser ces albums par défaut
      const defaultAlbums: Album[] = [
        {
          id: 'album_2024a',
          name: 'La Ride du Sasquatch 2024',
          description: 'Photos officielles de l\'événement de 2024',
          cover_photo: 'https://via.placeholder.com/400x300/3d1d00/ffffff?text=2024',
          facebook_url: 'https://www.facebook.com/media/set/?set=a.174653898414112&type=3',
          photos: [
            {
              id: '2024-01a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2024',
              caption: 'Album officiel 2024',
              created_time: '2024-05-15T10:00:00',
            },
            {
              id: '2024-02a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2024+2',
              caption: 'Départ de la course',
              created_time: '2024-05-16T10:00:00',
            },
            {
              id: '2024-03a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2024+3',
              caption: 'Les participants',
              created_time: '2024-05-16T11:30:00',
            }
          ]
        },
        {
          id: 'album_2023a',
          name: 'La Ride du Sasquatch 2023',
          description: 'Album principal de l\'événement en 2023',
          cover_photo: 'https://via.placeholder.com/400x300/3d1d00/ffffff?text=2023',
          facebook_url: 'https://www.facebook.com/media/set/?set=a.575541881658643&type=3',
          photos: [
            {
              id: '2023-01a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2023+1',
              caption: 'Album principal 2023',
              created_time: '2023-05-29T18:09:00',
            },
            {
              id: '2023-02a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2023+2',
              caption: 'Les équipes',
              created_time: '2023-05-29T19:00:00',
            },
            {
              id: '2023-03a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2023+3',
              caption: 'La remise des prix',
              created_time: '2023-05-30T10:00:00',
            }
          ]
        },
        {
          id: 'album_2022a',
          name: 'La Ride du Sasquatch 2022',
          description: 'Photos officielles de l\'édition 2022',
          cover_photo: 'https://via.placeholder.com/400x300/3d1d00/ffffff?text=2022',
          facebook_url: 'https://www.facebook.com/media/set/?set=a.566814939198004&type=3',
          photos: [
            {
              id: '2022-01a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2022+1',
              caption: 'Photos de l\'événement 2022',
              created_time: '2022-05-21T12:45:00',
            },
            {
              id: '2022-02a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2022+2',
              caption: 'Participants',
              created_time: '2022-05-21T13:30:00',
            },
            {
              id: '2022-03a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2022+3',
              caption: 'Arrivée',
              created_time: '2022-05-21T16:00:00',
            }
          ]
        },
        {
          id: 'album_recona',
          name: 'Reconnaissance du parcours',
          description: 'Photos de reconnaissance du parcours de la Ride du Sasquatch',
          cover_photo: 'https://via.placeholder.com/400x300/3d1d00/ffffff?text=Recon',
          facebook_url: 'https://www.facebook.com/media/set/?set=a.347866571092843&type=3',
          photos: [
            {
              id: 'recon-01a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Reconnaissance+1',
              caption: 'Reconnaissance du parcours',
              created_time: '2021-07-15T09:00:00',
            },
            {
              id: 'recon-02a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Reconnaissance+2',
              caption: 'Point de contrôle',
              created_time: '2021-07-15T10:15:00',
            },
            {
              id: 'recon-03a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Reconnaissance+3',
              caption: 'Test des zones',
              created_time: '2021-07-15T14:00:00',
            }
          ]
        },
        {
          id: 'album_2021a',
          name: 'La Ride du Sasquatch 2021',
          description: 'Photos de l\'édition de 2021',
          cover_photo: 'https://via.placeholder.com/400x300/3d1d00/ffffff?text=2021',
          facebook_url: 'https://www.facebook.com/media/set/?set=a.188131227066379&type=3',
          photos: [
            {
              id: '2021-01a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2021+1',
              caption: 'La Ride du Sasquatch 2021',
              created_time: '2021-05-15T18:09:00',
            },
            {
              id: '2021-02a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2021+2',
              caption: 'Départ',
              created_time: '2021-05-15T09:00:00',
            },
            {
              id: '2021-03a',
              url: 'https://via.placeholder.com/600x400/3d1d00/ffffff?text=Photo+2021+3',
              caption: 'Épreuve finale',
              created_time: '2021-05-15T16:30:00',
            }
          ]
        }
      ];

      setLocalAlbums(defaultAlbums);
      setSelectedAlbumId(defaultAlbums[0].id);
    }
  }, [dbAlbums, albumsLoading]);

  // Show loading state
  if (albumsLoading && localAlbums.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted h-48 rounded-lg mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="content-section">
          <h1 className="text-4xl font-bold mb-4 text-primary">Albums Photos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez les moments forts de La Ride du Sasquatch à travers nos albums photos officiels
          </p>
          <Separator className="my-6 bg-primary/20" />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">
          Ces albums sont synchronisés depuis notre page Facebook officielle. Pour plus de photos, visitez{' '}
          <a 
            href="https://www.facebook.com/sasquatchsag" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            facebook.com/sasquatchsag
          </a>
        </p>
      </div>

      <Tabs defaultValue={localAlbums[0]?.id} value={selectedAlbumId || undefined} onValueChange={setSelectedAlbumId}>
        <TabsList className="w-full md:w-auto flex flex-wrap gap-2 mb-6 overflow-x-hidden">
          {localAlbums.map((album) => (
            <TabsTrigger 
              key={album.id} 
              value={album.id}
              className="py-3 px-5 flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${album.cover_photo})` }} />
              <span>{album.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {localAlbums.map((album) => (
          <TabsContent key={album.id} value={album.id} className="space-y-4">
            <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-6 mb-6 border border-muted shadow-md">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <span className="mr-2 text-primary">📸</span>
                {album.name}
              </h2>
              {album.description && <p className="text-muted-foreground mt-2">{album.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {album.photos.map((photo) => (
                <a 
                  key={photo.id}
                  href={album.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:shadow-2xl"
                >
                  <Card className="overflow-hidden hover-shadow transition-all duration-300 border border-muted">
                    <div className="relative aspect-video">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || 'Photo de l\'événement'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Utiliser une image de remplacement garantie
                          const albumYear = album.name.match(/\d{4}/)?.[0] || '';
                          e.currentTarget.src = `https://via.placeholder.com/600x400/3d1d00/ffffff?text=Album+${albumYear}`;
                          e.currentTarget.onerror = null;
                        }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                        <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm flex items-center shadow-lg transform transition-transform duration-300 hover:scale-105">
                          <Facebook className="h-4 w-4 mr-2" />
                          Voir sur Facebook
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4 bg-gradient-to-b from-muted/10 to-card">
                      {photo.caption && <p className="font-medium text-foreground/90">{photo.caption}</p>}
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <span className="mr-1">&#128197;</span>
                        {new Date(photo.created_time).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button 
                asChild
                className="btn-interactive py-3 px-8 rounded-lg inline-flex items-center shadow-lg"
              >
                <a 
                  href={album.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Facebook className="mr-3 h-5 w-5" />
                  <span className="font-medium">Voir tous les photos sur Facebook</span>
                  <span className="ml-2">→</span>
                </a>
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FacebookAlbums;