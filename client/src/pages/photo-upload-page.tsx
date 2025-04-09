import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams, Link, Redirect } from 'wouter';
import PhotoUpload from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Team, Challenge } from '@shared/schema';
import { ChevronLeft, Camera, Eye } from 'lucide-react';
import NavBar from '@/components/NavBar'; // Assurez-vous que ce composant existe

export default function PhotoUploadPage() {
  const [searchParams] = useState<URLSearchParams>(() => new URLSearchParams(window.location.search));
  const teamCode = searchParams.get('code');
  const [, setLocation] = useLocation();
  
  // Fetch team by code
  const { 
    data: team, 
    isLoading: teamLoading, 
    error: teamError 
  } = useQuery<Team>({ 
    queryKey: [`/api/teams/code/${teamCode}`],
    enabled: !!teamCode,
  });
  
  // Fetch challenges
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
  
  if (teamLoading || challengesLoading) {
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
  
  if (challengesError || !challenges) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="container mx-auto p-4 flex-grow flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-destructive">Erreur de chargement</h1>
          <p className="mb-6">Impossible de charger les défis. Veuillez réessayer.</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }
  
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
            <h1 className="text-2xl font-bold">Soumettre une photo</h1>
            <p className="text-muted-foreground">Équipe: {team.name}</p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setLocation(`/team/photos?code=${teamCode}`)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Voir mes photos
          </Button>
        </div>
        
        <PhotoUpload team={team} challenges={challenges} />
        
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-4">Comment ça marche?</h2>
          <div className="bg-muted rounded-lg p-6">
            <ol className="list-decimal pl-6 space-y-2">
              <li>Sélectionnez un défi dans la liste déroulante</li>
              <li>Téléchargez une photo qui prouve que votre équipe a complété le défi</li>
              <li>Ajoutez des notes si nécessaire pour clarifier votre soumission</li>
              <li>Soumettez la photo pour examen</li>
              <li>Les administrateurs examineront votre soumission et l'approuveront ou la rejetteront</li>
              <li>Une fois approuvée, les points seront automatiquement ajoutés au score de votre équipe</li>
            </ol>
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded text-sm">
              <p className="font-semibold">Conseils pour maximiser vos chances d'approbation:</p>
              <ul className="list-disc pl-6 mt-1">
                <li>Assurez-vous que la photo est claire et montre clairement la réalisation du défi</li>
                <li>Au moins un membre de l'équipe doit être visible sur la photo</li>
                <li>Respectez les règles spécifiques mentionnées dans la description du défi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}