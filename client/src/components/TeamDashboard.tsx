import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Team, Photo, Challenge, InsertPhoto } from '@shared/schema';
import { Camera, MessageCircle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '../lib/queryClient';

interface TeamDashboardProps {
  code: string;
  teams: Team[];
  onLogout: () => void;
}

const TeamDashboard = ({ code, teams, onLogout }: TeamDashboardProps) => {
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [historicalChallenges, setHistoricalChallenges] = useState<{[key: string]: Challenge[]}>({
    '2024': []
  });

  useEffect(() => {
    if (challenges.length > 0) {
      setHistoricalChallenges({ '2024': challenges });
    }
  }, [challenges]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set team when the component mounts or teams/code change
  useEffect(() => {
    const foundTeam = teams.find(t => t.code === code);
    if (foundTeam) {
      setTeam(foundTeam);
    }
  }, [teams, code]);

  // Fetch team photos
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['/api/teams', team?.id, 'photos'],
    enabled: !!team?.id,
    queryFn: async () => {
      const response = await fetch(`/api/teams/${team?.id}/photos`);
      if (!response.ok) {
        throw new Error('Failed to fetch team photos');
      }
      return response.json();
    }
  });

  // Fetch challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/challenges'],
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (photoData: InsertPhoto) => {
      const response = await apiRequest('POST', '/api/photos', photoData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch photos
      queryClient.invalidateQueries({ queryKey: ['/api/teams', team?.id, 'photos'] });

      // Close the dialog and reset
      setUploadDialogOpen(false);
      setSelectedChallenge('');
      setUploadedImage(null);

      toast({
        title: "Photo soumise avec succès",
        description: "Votre photo a été soumise pour approbation.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la soumission",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we would upload the file to a storage service
    // and get a URL back. For this demo, we'll use a local URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle photo submission
  const handleSubmitPhoto = () => {
    if (!team || !selectedChallenge || !uploadedImage) {
      toast({
        title: "Information manquante",
        description: "Veuillez sélectionner un défi et télécharger une photo.",
        variant: "destructive",
      });
      return;
    }

    uploadPhotoMutation.mutate({
      teamId: team.id,
      challengeId: parseInt(selectedChallenge),
      photoUrl: uploadedImage,
      status: 'pending',
      notes: ''
    });
  };

  // Handle opening the photo upload dialog
  const openUploadDialog = () => {
    setUploadDialogOpen(true);
  };

  // Reset the photo upload form
  const resetUploadForm = () => {
    setSelectedChallenge('');
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate team initials for logo
  const getTeamInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Get team position in leaderboard
  const getTeamPosition = (team: Team): number => {
    const sortedTeams = [...teams].sort((a, b) => 
      (b.score ?? 0) - (a.score ?? 0)
    );
    return sortedTeams.findIndex(t => t.id === team.id) + 1;
  };

  // Get remaining challenges (not completed yet)
  const getRemainingChallenges = (challenges: Challenge[], photos: Photo[]): Challenge[] => {
    const completedChallengeIds = photos
      .filter(photo => photo.status === 'approved')
      .map(photo => photo.challengeId);

    return challenges.filter(challenge => !completedChallengeIds.includes(challenge.id));
  };

  if (!team) {
    return <div className="team-dashboard">Loading team data...</div>;
  }

  const teamInitials = getTeamInitials(team.name);
  const teamPosition = getTeamPosition(team);
  const typedPhotos = photos as Photo[];
  const typedChallenges = challenges as Challenge[];
  const completedChallenges = typedPhotos.filter(photo => photo.status === 'approved').length;
  const totalChallenges = typedChallenges.length;
  const remainingChallenges = getRemainingChallenges(typedChallenges, typedPhotos);

  return (
    <div className="team-dashboard">
      <div className="dashboard-header">
        <div className="team-info">
          <div className="team-logo" title={team.name}>
            {teamInitials}
          </div>
          <div>
            <h1>{team.name}</h1>
            <p>Capitaine: {team.captain}</p>
          </div>
        </div>
        <div className="team-stats">
          <div className="stat-box">
            <div className="stat-label">Score actuel</div>
            <div className="stat-value">{team.score}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Position</div>
            <div className="stat-value">
              {teamPosition}<span style={{ fontSize: '0.6em' }}>{teamPosition === 1 ? 'er' : 'e'}</span>
            </div>
          </div>
          <button className="wood-button" onClick={onLogout}>
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Photo Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Soumettre une photo</DialogTitle>
            <DialogDescription>
              Téléchargez une photo pour un défi et gagnez des points pour votre équipe.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="challenge" className="text-sm font-medium">
                Sélectionnez un défi
              </label>
              <Select
                value={selectedChallenge}
                onValueChange={setSelectedChallenge}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un défi" />
                </SelectTrigger>
                <SelectContent>
                  {typedChallenges.map((challenge) => (
                    <SelectItem key={challenge.id} value={challenge.id.toString()}>
                      {challenge.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="photo" className="text-sm font-medium">
                Télécharger une photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-400 px-6 py-10">
                {uploadedImage ? (
                  <div className="relative w-full">
                    <img 
                      src={uploadedImage} 
                      alt="Aperçu de l'image" 
                      className="h-64 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex flex-col items-center text-sm">
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer rounded-md font-semibold text-primary"
                      >
                        <span>Cliquez pour télécharger</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileUpload}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="text-muted-foreground mt-1">PNG, JPG, GIF jusqu'à 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline"
                onClick={resetUploadForm}
              >
                Annuler
              </Button>
            </DialogClose>
            <Button
              type="button"
              disabled={!selectedChallenge || !uploadedImage || uploadPhotoMutation.isPending}
              onClick={handleSubmitPhoto}
              className="flex gap-1 items-center"
            >
              {uploadPhotoMutation.isPending ? 'Soumission...' : 'Soumettre'} 
              <Upload size={16} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="team-section">
            <h2>Progression des défis</h2>
            <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-1">
                <span>Défis complétés</span>
                <span className="text-[#f4c542]">{completedChallenges}/{totalChallenges}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill transition-all duration-1000 ease-out relative" 
                  style={{ width: `${(completedChallenges / totalChallenges) * 100}%` }}
                >
                  <span className="absolute -right-4 -top-6 bg-[#f4c542] text-black px-2 py-1 rounded text-xs">
                    {Math.round((completedChallenges / totalChallenges) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-1 mt-4">
                <span>Photos soumises</span>
                <span className="text-[#f4c542]">{photos.length}/{totalChallenges * 2}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(photos.length / (totalChallenges * 2)) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <button className="gold-button" onClick={openUploadDialog}>
                  <Camera size={18} />
                  Soumettre une photo
                </button>
                <button 
                  className="wood-button"
                  onClick={() => window.open('https://m.me/LarideduSasquatch', '_blank')}
                >
                  <MessageCircle size={18} />
                  Support Messenger
                </button>
              </div>
            </div>
          </div>

          <div className="team-section">
            <h2>Album photos</h2>
            {photosLoading ? (
              <p>Chargement des photos...</p>
            ) : photos.length === 0 ? (
              <p>Aucune photo soumise pour le moment.</p>
            ) : (
              <div className="photo-grid">
                {typedPhotos.map((photo) => (
                  <div key={photo.id} className="photo-item">
                    <div className="relative">
                      <img 
                        src={photo.photoUrl} 
                        alt="Photo d'équipe" 
                        className="photo-img" 
                      />
                      <div className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs ${
                        photo.status === 'approved' ? 'bg-green-500 text-white' :
                        photo.status === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black'
                      }`}>
                        {photo.status === 'approved' ? 'Validée' :
                         photo.status === 'rejected' ? 'Refusée' : 'En révision'}
                      </div>
                    </div>
                    <div className="photo-info">
                      <p className="photo-title">
                        {typedChallenges.find(c => c.id === photo.challengeId)?.name || 'Photo'}
                      </p>
                      <p className="photo-date">
                        {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                ))}
                <div 
                  className="flex items-center justify-center border-2 border-dashed border-[#f4c542] rounded-lg aspect-square cursor-pointer hover:bg-[rgba(255,255,255,0.05)]"
                  onClick={openUploadDialog}
                >
                  <div className="text-center">
                    <Camera className="mx-auto text-[#f4c542]" size={32} />
                    <p className="mt-2">Ajouter une photo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="team-section mb-6">
            <h2>Prochains défis</h2>
            {challengesLoading ? (
              <p>Chargement des défis...</p>
            ) : remainingChallenges.length === 0 ? (
              <p>Tous les défis sont complétés!</p>
            ) : (
              <div className="space-y-3">
                {remainingChallenges.slice(0, 3).map((challenge) => (
                  <div key={challenge.id} className="challenge-item">
                    <div className={`challenge-icon ${challenge.type === 'photo' ? 'challenge-photo' : 'challenge-task'}`}>
                      {challenge.type === 'photo' ? (
                        <Camera size={20} className="text-white" />
                      ) : (
                        <div className="text-white font-bold">!</div>
                      )}
                    </div>
                    <div className="challenge-info">
                      <h4>{challenge.name}</h4>
                      <p>{challenge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="team-section">
            <h2>Feed Facebook</h2>
            <div className="facebook-feed">
              <div className="facebook-header">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="font-semibold">La Ride du Sasquatch</span>
              </div>
              <div className="facebook-content">
                <p className="facebook-post">
                  Les équipes sont en feu aujourd'hui! Voyez les dernières photos de nos courageux participants! #LARideDuSasquatch #AvantureEnPleinAir
                </p>
                <img 
                  src="https://images.unsplash.com/photo-1517457210348-703079e57d4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
                  alt="Publication Facebook" 
                  className="facebook-image" 
                />
                <div className="facebook-stats">
                  <span>89 J'aime</span>
                  <span>23 Commentaires</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;