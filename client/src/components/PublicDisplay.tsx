import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Team, Photo } from '@shared/schema';
import { Info, Facebook } from 'lucide-react';
import { LoadingSpinner } from './ui/loading-spinner';

interface PublicDisplayProps {
  teams: Team[];
}

const PublicDisplay = ({ teams }: PublicDisplayProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [facebookPosts, setFacebookPosts] = useState<string[]>([
    "Super journée à La Ride du Sasquatch! Les équipes ont relevé des défis incroyables. #RideDuSasquatch",
    "Félicitations à l'équipe Bébittes moniteur pour leur performance au défi du Yoga Ball! #TeamSpirit",
    "Les photos commencent à arriver! Quelle créativité de la part des participants cette année! #LRDS2025"
  ]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (response.ok) {
          const data = await response.json();
          setPhotos(data.filter((photo: Photo) => photo.status === 'approved'));
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();

    // Refresh photos every 30 seconds
    const interval = setInterval(fetchPhotos, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sort teams by score in descending order
  const sortedTeams = [...teams].sort((a, b) => (b.score || 0) - (a.score || 0));

  // Get team initials for logo
  const getTeamInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Get team name from team ID
  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Équipe inconnue';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="public-display">
      <div className="bg-primary/10 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">La Ride du Sasquatch 2025</h2>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <Link to={new Date() >= new Date('2025-05-01') ? '/participate' : '#'}>
              <div className="inline-block bg-primary/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/30 transition-colors">
                <h3 className="text-xl font-semibold">
                  {new Date() >= new Date('2025-05-01') 
                    ? "Inscriptions ouvertes - Cliquez ici" 
                    : "Inscriptions ouvertes à partir du 1er Mai 2025"}
                </h3>
              </div>
            </Link>
          </div>

          <div className="text-center space-y-4 mb-12">
            <p className="text-lg">Restez informé des dernières nouvelles!</p>
            <p className="text-sm italic mb-4">Inscrivez-vous à notre infolettre pour recevoir toutes les mises à jour.</p>
            
            <form
              action="https://formsubmit.co/agence.creative.polymedia@outlook.com"
              method="POST"
              className="max-w-md mx-auto"
              onSubmit={(e) => {
                const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
                if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                  e.preventDefault();
                  alert('Veuillez entrer une adresse courriel valide');
                }
              }}
            >
              <input type="hidden" name="_subject" value="Nouvelle inscription infolettre La Ride du Sasquatch" />
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Votre adresse courriel"
                  className="flex-1 px-4 py-2 rounded border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  S'inscrire
                </button>
              </div>
            </form>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Informations importantes</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Date: Entre le 12 et 31 octobre 2025 (à confirmer)</li>
                <li>Lieu de départ: Domain le Cajot (à confirmer)</li>
                <li>Nouveauté: Soirée "party" (10$ supplémentaire)</li>
                <li>Défis photos aux quatre coins de la région</li>
                <li>Suivi en temps réel des équipes</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Comment participer</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Former une équipe de 2 à 4 personnes</li>
                <li>Disposer d'un véhicule</li>
                <li>Avoir un téléphone intelligent</li>
                <li>S'inscrire dès le 1er Mai 2025</li>
              </ul>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-lg">Restez informé des dernières nouvelles!</p>
            <p className="text-sm italic">Inscrivez-vous à notre infolettre pour recevoir toutes les mises à jour.</p>
          </div>
        </div>
      </div>

      <div className="public-display-container">
        {/* Leaderboard Section */}
        <div className="leaderboard">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded mr-2">🏆</span> 
            Classement des équipes
          </h3>

          {sortedTeams.map((team, index) => (
            <div key={team.id} className="team-card">
              <div className="flex items-center">
                <span className="team-rank">{index + 1}</span>
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center mx-2">
                  <span className="font-bold text-primary-foreground">{getTeamInitials(team.name)}</span>
                </div>
                <div>
                  <h4 className="font-medium">{team.name}</h4>
                  <p className="text-sm text-muted-foreground">Capitaine: {team.captain}</p>
                </div>
              </div>
              <div className="text-xl font-bold">{team.score || 0} pts</div>
            </div>
          ))}
        </div>

        {/* Social Feed Section */}
        <div className="social-feed">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <Facebook className="h-5 w-5 mr-2 text-blue-600" /> 
            Fils d'actualités et photos
          </h3>

          {/* Facebook-style Posts */}
          <div className="space-y-4 mb-6">
            {facebookPosts.map((post, index) => (
              <div key={index} className="bg-muted p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center text-primary-foreground font-bold">LS</div>
                  <div className="ml-2">
                    <p className="font-medium">La Ride du Sasquatch</p>
                    <p className="text-xs text-muted-foreground">il y a {index + 1} heure{index > 0 ? 's' : ''}</p>
                  </div>
                </div>
                <p>{post}</p>
              </div>
            ))}
          </div>

          {/* Photo Gallery */}
          <h4 className="font-medium mb-2">Photos récentes des équipes</h4>
          {loading ? (
            <p>Chargement des photos...</p>
          ) : photos.length > 0 ? (
            <div className="photo-gallery">
              {photos.map(photo => (
                <div key={photo.id} className="photo-item">
                  <img src={photo.photoUrl} alt={`Photo de l'équipe ${getTeamName(photo.teamId)}`} />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-xs">
                    {getTeamName(photo.teamId)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucune photo approuvée pour le moment</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <form
          action="https://formsubmit.co/agence.creative.polymedia@outlook.com"
          method="POST"
          className="max-w-md mx-auto"
          onSubmit={(e) => {
            const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
              e.preventDefault();
              alert('Veuillez entrer une adresse courriel valide');
            }
          }}
        >
          <input type="hidden" name="_subject" value="Nouvelle inscription infolettre La Ride du Sasquatch" />
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="Votre adresse courriel"
              className="flex-1 px-4 py-2 rounded border bg-background focus:ring-2 focus:ring-primary/50 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              S'inscrire
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Recevez toutes les mises à jour sur l'événement</p>
        </form>
      </div>

      <div className="mt-6 flex justify-center">
        <a href="https://www.facebook.com/LarideduSasquatch" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Info size={18} />
          En savoir plus sur La Ride du Sasquatch
        </a>
      </div>
    </div>
  );
};

export default PublicDisplay;