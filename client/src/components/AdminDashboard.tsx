import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team, Challenge, Photo, InsertTeam, InsertChallenge } from '@shared/schema';
import { 
  Edit, 
  Camera, 
  MessageCircle, 
  BarChart3, 
  LogOut, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Save, 
  Trash2 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// UI components
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminDashboardProps {
  teams: Team[];
  onLogout: () => void;
}

const AdminDashboard = ({ teams, onLogout }: AdminDashboardProps) => {
  const queryClient = useQueryClient();

  // Fetch photos
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['/api/photos'],
  });

  // Fetch challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/challenges'],
  });

  // Update team score mutation
  const updateTeamScore = useMutation({
    mutationFn: async ({ teamId, score }: { teamId: number, score: number }) => {
      const res = await apiRequest('PATCH', `/api/teams/${teamId}/score`, { score });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
    }
  });

  // Update photo status mutation
  const updatePhotoStatus = useMutation({
    mutationFn: async ({ photoId, status, notes }: { photoId: number, status: string, notes?: string }) => {
      const res = await apiRequest('PATCH', `/api/photos/${photoId}/status`, { status, notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
    }
  });

  // Get team initials for logo
  const getTeamInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Calculate statistics
  const getTotalCompletedChallenges = (): number => {
    return (photos as Photo[]).filter(photo => photo.status === 'approved').length;
  };

  const getTotalPhotos = (): number => {
    return (photos as Photo[]).length;
  };

  const getAverageScore = (): number => {
    if (teams.length === 0) return 0;
    const totalScore = teams.reduce((sum, team) => sum + team.score, 0);
    return Math.round(totalScore / teams.length);
  };

  // Dialog states
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingScore, setEditingScore] = useState<number | null>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Partial<InsertChallenge>>({
    name: '',
    description: '',
    type: 'photo',
    points: 10,
    coordsLat: '',
    coordsLng: ''
  });

  // Handle team editing
  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditingScore(team.score);
    setIsTeamDialogOpen(true);
  };

  // Handle score update
  const handleScoreUpdate = () => {
    if (!editingTeam || editingScore === null) return;

    updateTeamScore.mutate({
      teamId: editingTeam.id,
      score: editingScore
    }, {
      onSuccess: () => {
        toast({
          title: 'Score mis à jour',
          description: `Le score de ${editingTeam.name} a été mis à jour.`,
        });
        setIsTeamDialogOpen(false);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la mise à jour du score.',
          variant: 'destructive',
        });
      }
    });
  };

  // Handle photo review
  const handlePhotoReview = (photo: Photo) => {
    setSelectedPhoto(photo);
    setRejectionNote('');
    setIsPhotoDialogOpen(true);
  };

  // Handle photo status change
  const handleStatusChange = (status: string) => {
    if (!selectedPhoto) return;
    
    if (status === 'approved') {
      import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      });
    }

    updatePhotoStatus.mutate({
      photoId: selectedPhoto.id,
      status,
      notes: status === 'rejected' ? rejectionNote : undefined
    }, {
      onSuccess: () => {
        toast({
          title: status === 'approved' ? 'Photo approuvée' : 'Photo refusée',
          description: status === 'approved' 
            ? 'La photo a été approuvée et des points ont été attribués à l\'équipe.' 
            : 'La photo a été refusée avec une note explicative.',
        });
        setIsPhotoDialogOpen(false);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la mise à jour du statut de la photo.',
          variant: 'destructive',
        });
      }
    });
  };

  // Handle challenge creation
  const createChallengeMutation = useMutation({
    mutationFn: async (challenge: InsertChallenge) => {
      const res = await apiRequest('POST', '/api/challenges', challenge);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      toast({
        title: 'Défi créé',
        description: 'Le nouveau défi a été créé avec succès.',
      });
      setChallengeDialogOpen(false);
      setNewChallenge({
        name: '',
        description: '',
        type: 'photo',
        points: 10,
        coordsLat: '',
        coordsLng: ''
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du défi.',
        variant: 'destructive',
      });
    }
  });

  const handleChallengeSubmit = () => {
    if (!newChallenge.name || !newChallenge.description) {
      toast({
        title: 'Formulaire incomplet',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    createChallengeMutation.mutate(newChallenge as InsertChallenge);
  };

  const handleChallengeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewChallenge(prev => ({
      ...prev,
      [name]: name === 'points' ? Number(value) : value
    }));
  };

  const handleChallengeTypeChange = (value: string) => {
    setNewChallenge(prev => ({
      ...prev,
      type: value
    }));
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Administration du Sasquatch</h1>
        <button className="wood-button" onClick={onLogout}>
          <LogOut className="mr-2" size={16} />
          Se déconnecter
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-[rgba(0,0,0,0.3)] p-1 rounded-md mb-6">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#1c1c1c]">
            <BarChart3 className="mr-2" size={16} />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#1c1c1c]">
            <Edit className="mr-2" size={16} />
            Équipes
          </TabsTrigger>
          <TabsTrigger value="photos" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#1c1c1c]">
            <Camera className="mr-2" size={16} />
            Photos
          </TabsTrigger>
          <TabsTrigger value="challenges" className="data-[state=active]:bg-[#f4c542] data-[state=active]:text-[#1c1c1c]">
            <Plus className="mr-2" size={16} />
            Défis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg">
              <h2 className="mb-4">Statistiques</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[rgba(28,28,28,0.5)] p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Équipes</p>
                  <p className="text-3xl text-[#f4c542]">{teams.length}</p>
                </div>
                <div className="bg-[rgba(28,28,28,0.5)] p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Défis complétés</p>
                  <p className="text-3xl text-[#f4c542]">{getTotalCompletedChallenges()}</p>
                </div>
                <div className="bg-[rgba(28,28,28,0.5)] p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Photos soumises</p>
                  <p className="text-3xl text-[#f4c542]">{getTotalPhotos()}</p>
                </div>
                <div className="bg-[rgba(28,28,28,0.5)] p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Score moyen</p>
                  <p className="text-3xl text-[#f4c542]">{getAverageScore()}</p>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg lg:col-span-2">
              <h2 className="mb-4">Actions rapides</h2>
              <div className="flex flex-wrap gap-2">
                <button className="gold-button" onClick={() => setChallengeDialogOpen(true)}>
                  <Plus size={16} className="mr-2" />
                  Ajouter un défi
                </button>
                <button className="wood-button" onClick={() => setActiveTab('photos')}>
                  <Camera size={16} className="mr-2" />
                  Valider photos
                </button>
                <button className="wood-button" onClick={() => setActiveTab('teams')}>
                  <Edit size={16} className="mr-2" />
                  Modifier scores
                </button>
                <button className="wood-button">
                  <MessageCircle size={16} className="mr-2" />
                  Envoyer message
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg mb-8">
            <h2 className="mb-4 flex justify-between items-center">
              <span>Photos en attente de validation</span>
              <button 
                className="text-sm text-[#f4c542] hover:underline flex items-center"
                onClick={() => setActiveTab('photos')}
              >
                Voir toutes
              </button>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photosLoading ? (
                <p>Chargement des photos...</p>
              ) : (
                (photos as Photo[])
                  .filter(photo => photo.status === 'pending')
                  .slice(0, 3)
                  .map(photo => (
                    <div 
                      key={photo.id} 
                      className="bg-[rgba(28,28,28,0.5)] rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => handlePhotoReview(photo)}
                    >
                      <div className="aspect-video relative">
                        <img src={photo.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-yellow-500 text-xs text-black font-medium px-2 py-1 rounded-full">
                          En attente
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-medium">
                          {teams.find(t => t.id === photo.teamId)?.name || 'Équipe inconnue'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {challenges.find(c => c.id === photo.challengeId)?.name || 'Défi inconnu'}
                        </p>
                      </div>
                    </div>
                  ))
              )}
              {!photosLoading && (photos as Photo[]).filter(photo => photo.status === 'pending').length === 0 && (
                <p className="text-gray-400 col-span-3 text-center py-4">Aucune photo en attente de validation</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2>Gestion des équipes</h2>
              <button 
                className="gold-button"
                onClick={() => {
                  setEditingTeam({
                    id: 0,
                    name: '',
                    code: '',
                    captain: '',
                    email: '',
                    phone: '',
                    score: 0,
                    logo: ''
                  });
                  setEditingScore(0);
                  setIsTeamDialogOpen(true);
                }}
              >
                <Plus size={16} className="mr-2" />
                Nouvelle équipe
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Équipe</th>
                    <th>Capitaine</th>
                    <th>Contact</th>
                    <th className="text-center">Score</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className="bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)] transition-colors">
                      <td className="border-b border-gray-700">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-[#f4c542] flex items-center justify-center mr-3">
                            <span className="font-bold text-[#1c1c1c]">{getTeamInitials(team.name)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-xs text-gray-400">Code: {team.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-gray-700">{team.captain}</td>
                      <td className="border-b border-gray-700">
                        <a href={`mailto:${team.email || ''}`} className="text-[#f4c542] underline hover:text-opacity-80">
                          {team.email || 'N/A'}
                        </a>
                        <p className="text-xs text-gray-400">{team.phone || 'N/A'}</p>
                      </td>
                      <td className="border-b border-gray-700 text-center">
                        <span className="inline-block bg-[#f4c542] text-[#1c1c1c] rounded-full px-3 py-1 font-bold">
                          {team.score}
                        </span>
                      </td>
                      <td className="border-b border-gray-700 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            className="icon-button" 
                            title="Modifier le score"
                            onClick={() => handleEditTeam(team)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="icon-button" 
                            title="Voir les photos"
                            onClick={() => {
                              setActiveTab('photos');
                              // Note: would need to add filtering by team logic
                            }}
                          >
                            <Camera size={18} />
                          </button>
                          <button 
                            className="icon-button" 
                            title="Envoyer un message"
                            onClick={() => window.open(`https://m.me/${team.facebookProfile || 'LarideduSasquatch'}`, '_blank')}
                          >
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg mb-8">
            <h2 className="mb-4">Validation des photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photosLoading ? (
                <p>Chargement des photos...</p>
              ) : (
                (photos as Photo[]).map(photo => (
                  <div 
                    key={photo.id} 
                    className="bg-[rgba(28,28,28,0.5)] rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handlePhotoReview(photo)}
                  >
                    <div className="aspect-video relative">
                      <img src={photo.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                      <div 
                        className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-medium ${
                          photo.status === 'approved' ? 'bg-green-500 text-white' :
                          photo.status === 'rejected' ? 'bg-red-500 text-white' :
                          'bg-yellow-500 text-black'
                        }`}
                      >
                        {photo.status === 'approved' ? 'Approuvée' :
                         photo.status === 'rejected' ? 'Refusée' : 'En attente'}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-medium">
                        {teams.find(t => t.id === photo.teamId)?.name || 'Équipe inconnue'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {challenges.find(c => c.id === photo.challengeId)?.name || 'Défi inconnu'}
                      </p>
                      {photo.status === 'rejected' && photo.notes && (
                        <p className="text-xs text-red-400 mt-1">Note: {photo.notes}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="challenges">
          <div className="bg-[rgba(0,0,0,0.3)] p-4 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2>Gestion des défis</h2>
              <button 
                className="gold-button"
                onClick={() => setChallengeDialogOpen(true)}
              >
                <Plus size={16} className="mr-2" />
                Nouveau défi
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th className="text-center">Points</th>
                    <th>Description</th>
                    <th className="text-center">Coordonnées</th>
                  </tr>
                </thead>
                <tbody>
                  {challengesLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">Chargement des défis...</td>
                    </tr>
                  ) : (
                    (challenges as Challenge[]).map(challenge => (
                      <tr key={challenge.id} className="bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)] transition-colors">
                        <td className="border-b border-gray-700 font-medium">{challenge.name}</td>
                        <td className="border-b border-gray-700">
                          <span 
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              challenge.type === 'photo' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                            }`}
                          >
                            {challenge.type}
                          </span>
                        </td>
                        <td className="border-b border-gray-700 text-center">
                          <span className="inline-block bg-[#f4c542] text-[#1c1c1c] rounded-full px-2 py-1 text-xs font-bold">
                            {challenge.points}
                          </span>
                        </td>
                        <td className="border-b border-gray-700 max-w-xs truncate">{challenge.description}</td>
                        <td className="border-b border-gray-700 text-center text-xs font-mono">
                          {challenge.coordsLat}, {challenge.coordsLng}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Team Edit Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="bg-[#2b1500] border-[#f4c542] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'équipe: {editingTeam?.name}</DialogTitle>
            <DialogClose onClick={() => setIsTeamDialogOpen(false)}/>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">Nom de l'équipe</Label>
                <Input
                  id="team-name"
                  type="text"
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={editingTeam?.name || ''}
                  onChange={(e) => setEditingTeam(prev => ({...prev, name: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="team-code">Code de l'équipe</Label>
                <Input
                  id="team-code"
                  type="text"
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={editingTeam?.code || ''}
                  onChange={(e) => setEditingTeam(prev => ({...prev, code: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="team-captain">Capitaine</Label>
                <Input
                  id="team-captain"
                  type="text"
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={editingTeam?.captain || ''}
                  onChange={(e) => setEditingTeam(prev => ({...prev, captain: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="team-email">Email</Label>
                <Input
                  id="team-email"
                  type="email"
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={editingTeam?.email || ''}
                  onChange={(e) => setEditingTeam(prev => ({...prev, email: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="team-phone">Téléphone</Label>
                <Input
                  id="team-phone"
                  type="tel"
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={editingTeam?.phone || ''}
                  onChange={(e) => setEditingTeam(prev => ({...prev, phone: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="team-score">Score</Label>
                <Input
                  id="team-score"
                  type="number"
                  min={0}
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={editingScore !== null ? editingScore : ''}
                  onChange={(e) => setEditingScore(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="team-logo">Logo (URL)</Label>
                <Input
                  id="team-logo"
                  type="text"
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={editingTeam?.logo || ''}
                  onChange={(e) => setEditingTeam(prev => ({...prev, logo: e.target.value}))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTeamDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-[#f4c542] text-[#1c1c1c] hover:bg-[#d6a930]"
              onClick={handleScoreUpdate}
              disabled={updateTeamScore.isPending}
            >
              {updateTeamScore.isPending ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Review Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="bg-[#2b1500] border-[#f4c542] text-white max-w-xl">
          <DialogHeader>
            <DialogTitle>Révision de photo</DialogTitle>
            <DialogClose onClick={() => setIsPhotoDialogOpen(false)}/>
          </DialogHeader>
          {selectedPhoto && (
            <div className="py-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <img 
                  src={selectedPhoto.photoUrl} 
                  alt="Soumission" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Équipe</Label>
                  <p className="font-medium">
                    {teams.find(t => t.id === selectedPhoto.teamId)?.name || 'Équipe inconnue'}
                  </p>
                </div>
                <div>
                  <Label>Défi</Label>
                  <p className="font-medium">
                    {challenges.find(c => c.id === selectedPhoto.challengeId)?.name || 'Défi inconnu'}
                  </p>
                </div>
                <div>
                  <Label>Statut actuel</Label>
                  <p className="font-medium">
                    <span 
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        selectedPhoto.status === 'approved' ? 'bg-green-500 text-white' :
                        selectedPhoto.status === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black'
                      }`}
                    >
                      {selectedPhoto.status === 'approved' ? 'Approuvée' :
                       selectedPhoto.status === 'rejected' ? 'Refusée' : 'En attente'}
                    </span>
                  </p>
                </div>
                <div>
                  <Label>Date de soumission</Label>
                  <p className="font-medium">
                    {selectedPhoto.createdAt 
                      ? new Date(selectedPhoto.createdAt).toLocaleDateString() 
                      : 'Date inconnue'}
                  </p>
                </div>
              </div>

              {selectedPhoto.status === 'pending' && (
                <>
                  <div className="mb-4">
                    <Label htmlFor="rejection-note">Note de refus (obligatoire pour rejeter)</Label>
                    <Textarea
                      id="rejection-note"
                      className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                      placeholder="Raison du refus si applicable..."
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => handleStatusChange('rejected')}
                      disabled={!rejectionNote || updatePhotoStatus.isPending}
                    >
                      <XCircle className="mr-2" size={16} />
                      Refuser
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleStatusChange('approved')}
                      disabled={updatePhotoStatus.isPending}
                    >
                      <CheckCircle className="mr-2" size={16} />
                      Approuver
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Challenge Creation Dialog */}
      <Dialog open={challengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
        <DialogContent className="bg-[#2b1500] border-[#f4c542] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau défi</DialogTitle>
            <DialogClose onClick={() => setChallengeDialogOpen(false)}/>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="challenge-name">Nom du défi</Label>
                <Input
                  id="challenge-name"
                  name="name"
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={newChallenge.name}
                  onChange={handleChallengeChange}
                  placeholder="Ex: Défi de la montagne"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="challenge-type">Type</Label>
                  <Select 
                    value={newChallenge.type} 
                    onValueChange={handleChallengeTypeChange}
                  >
                    <SelectTrigger className="mt-1 bg-[#3d1d00] text-white border-[#552b00]">
                      <SelectValue placeholder="Type de défi" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#3d1d00] text-white border-[#552b00]">
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="défi">Tâche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="challenge-points">Points</Label>
                  <Input
                    id="challenge-points"
                    name="points"
                    type="number"
                    min={1}
                    className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                    value={newChallenge.points}
                    onChange={handleChallengeChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="challenge-description">Description</Label>
                <Textarea
                  id="challenge-description"
                  name="description"
                  className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                  value={newChallenge.description}
                  onChange={handleChallengeChange}
                  placeholder="Description détaillée du défi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="challenge-lat">Latitude</Label>
                  <Input
                    id="challenge-lat"
                    name="coordsLat"
                    className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                    value={newChallenge.coordsLat}
                    onChange={handleChallengeChange}
                    placeholder="Ex: 48.4283"
                  />
                </div>
                <div>
                  <Label htmlFor="challenge-lng">Longitude</Label>
                  <Input
                    id="challenge-lng"
                    name="coordsLng"
                    className="mt-1 bg-[#3d1d00] text-white border-[#552b00]"
                    value={newChallenge.coordsLng}
                    onChange={handleChallengeChange}
                    placeholder="Ex: -71.0686"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChallengeDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="bg-[#f4c542] text-[#1c1c1c] hover:bg-[#d6a930]"
              onClick={handleChallengeSubmit}
              disabled={createChallengeMutation.isPending}
            >
              {createChallengeMutation.isPending ? 'Création...' : 'Créer le défi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;