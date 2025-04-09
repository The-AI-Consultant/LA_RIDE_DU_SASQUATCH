import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Redirect } from 'wouter';
import { Button } from '@/components/ui/button';
import { Team, Challenge, Photo } from '@shared/schema';
import { ChevronLeft, Camera, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import NavBar from '@/components/NavBar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusIcons = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />
};

const statusText = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée"
};

const statusVariant: Record<string, "default" | "outline" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive"
};

export default function TeamPhotosPage() {
  const [searchParams] = useState<URLSearchParams>(() => new URLSearchParams(window.location.search));
  const teamCode = searchParams.get('code');
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch team by code
  const { 
    data: team, 
    isLoading: teamLoading, 
    error: teamError 
  } = useQuery<Team>({ 
    queryKey: [`/api/teams/code/${teamCode}`],
    enabled: !!teamCode,
  });
  
  // Fetch team photos
  const { 
    data: photos, 
    isLoading: photosLoading, 
    error: photosError 
  } = useQuery<Photo[]>({ 
    queryKey: [`/api/teams/${team?.id}/photos`],
    enabled: !!team?.id,
  });
  
  // Fetch challenges for reference
  const { 
    data: challenges, 
    isLoading: challengesLoading, 
    error: challengesError 
  } = useQuery<Challenge[]>({ 
    queryKey: ['/api/challenges'],
  });

  if (!teamCode) {
    return <Redirect to="/login" />;
  }
  
  if (teamLoading || photosLoading || challengesLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (teamError || !team) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="container mx-auto p-4 flex-grow flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Équipe non trouvée</h1>
          <p className="mb-6">Le code d'équipe n'est pas valide. Veuillez vous connecter à nouveau.</p>
          <Button onClick={() => setLocation('/login')}>
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }
  
  if (photosError || !photos) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="container mx-auto p-4 flex-grow flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Erreur de chargement</h1>
          <p className="mb-6">Impossible de charger vos photos. Veuillez réessayer.</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
  
  const getChallengeById = (id: number) => {
    return challenges?.find(c => c.id === id) || null;
  };
  
  // Define status filters with type safety
  const allPhotos = photos || [];
  const photosByStatus: Record<string, Photo[]> = {
    all: allPhotos,
    pending: allPhotos.filter(p => p.status === 'pending'),
    approved: allPhotos.filter(p => p.status === 'approved'),
    rejected: allPhotos.filter(p => p.status === 'rejected')
  };
  
  const currentPhotos = photosByStatus[activeTab as keyof typeof photosByStatus] || photos;
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <div className="container mx-auto p-4 flex-grow">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation(`/team?code=${teamCode}`)}
              className="mb-2"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
            <h1 className="text-2xl font-bold">Photos de l'équipe</h1>
            <p className="text-muted-foreground">Équipe: {team.name}</p>
          </div>
          
          <Button
            onClick={() => setLocation(`/team/upload?code=${teamCode}`)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Soumettre une nouvelle photo
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all" className="flex gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Toutes</span>
              <Badge variant="outline" className="ml-1">{photos.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">En attente</span>
              <Badge variant="outline" className="ml-1">{photosByStatus.pending.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Approuvées</span>
              <Badge variant="outline" className="ml-1">{photosByStatus.approved.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex gap-2">
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Rejetées</span>
              <Badge variant="outline" className="ml-1">{photosByStatus.rejected.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          {['all', 'pending', 'approved', 'rejected'].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className="mt-6">
              {currentPhotos.length === 0 ? (
                <div className="text-center p-12 bg-muted/50 rounded-lg border border-border">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Aucune photo {tabValue !== 'all' ? `${statusText[tabValue as keyof typeof statusText].toLowerCase()}` : ''}</h3>
                  <p className="text-muted-foreground mb-6">
                    {tabValue === 'all' 
                      ? "Soumettez votre première photo pour valider un défi!"
                      : tabValue === 'pending' 
                        ? "Vous n'avez aucune photo en attente d'approbation."
                        : tabValue === 'approved'
                          ? "Aucune de vos photos n'a encore été approuvée."
                          : "Aucune de vos photos n'a été rejetée."
                    }
                  </p>
                  {(tabValue === 'all' || tabValue === 'pending') && (
                    <Button
                      onClick={() => setLocation(`/team/upload?code=${teamCode}`)}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Soumettre une photo
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPhotos.map((photo) => {
                    const challenge = getChallengeById(photo.challengeId);
                    return (
                      <Card key={photo.id} className="overflow-hidden">
                        <div className="relative aspect-square">
                          <img 
                            src={photo.photoUrl} 
                            alt={`Défi ${challenge?.name || 'inconnu'}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge 
                              variant={photo.status && statusVariant[photo.status] ? statusVariant[photo.status] : 'default'} 
                              className="flex items-center gap-1"
                            >
                              {photo.status && statusIcons[photo.status as keyof typeof statusIcons]}
                              {photo.status && statusText[photo.status as keyof typeof statusText] || 'En attente'}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader>
                          <CardTitle className="flex justify-between items-start">
                            <span>{challenge?.name || 'Défi inconnu'}</span>
                            <span className="text-sm font-normal text-primary">{challenge?.points || 0} pts</span>
                          </CardTitle>
                          <CardDescription>
                            Soumise le {photo.createdAt ? format(new Date(photo.createdAt), 'PPP', { locale: fr }) : 'date inconnue'}
                          </CardDescription>
                        </CardHeader>
                        {(photo.notes || photo.status === 'rejected') && (
                          <CardContent>
                            {photo.notes && <p className="text-sm">{photo.notes}</p>}
                            {photo.status === 'rejected' && (
                              <div className="mt-2 p-3 bg-destructive/10 rounded-md text-sm">
                                <p className="font-semibold text-destructive">Raison du rejet:</p>
                                <p>{photo.notes || 'Aucune raison spécifiée'}</p>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}