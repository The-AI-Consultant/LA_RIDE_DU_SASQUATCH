import { useState, useEffect } from 'react';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import TeamDashboard from './components/TeamDashboard';
import AdminDashboard from './components/AdminDashboard';
import PublicDisplay from './components/PublicDisplay';
import MapInteractive from './components/MapInteractive';
import IntroPage from './components/IntroPage';
import NavBar from './components/NavBar';
import HowToParticipate from './components/HowToParticipate';
import FacebookAlbums from './components/FacebookAlbums';
import PhotoUploadPage from './pages/photo-upload-page';
import TeamPhotosPage from './pages/team-photos-page';
import ContactPage from './pages/contact-page';
import NotFound from './pages/not-found';
import { Team } from '@shared/schema';
import { Switch, Route, useLocation, Redirect } from 'wouter';

function App() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setTeams(data);
        setLoading(false);
      } catch (err) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : 'An error occurred while fetching teams',
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchTeams();
  }, [toast]);

  // Login page component
  const LoginPage = () => {
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleAccessCode = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAccessCode(e.target.value.toUpperCase());
      if (error) setError(null);
    };

    const handleAccess = () => {
      if (accessCode === 'ADMIN2025') {
        // Go to admin dashboard
        window.location.href = '/admin';
      } else if (teams.find((team) => team.code === accessCode)) {
        // Go to team dashboard with the code as a query parameter
        window.location.href = `/team?code=${accessCode}`;
      } else {
        setError('Code d\'accès invalide. Veuillez réessayer.');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAccess();
      }
    };

    return (
      <div className="access-screen">
        <h1>La Ride du Sasquatch - HUB du Sasquatch</h1>
        
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Entrer votre code d'accès..."
          value={accessCode}
          onChange={handleAccessCode}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleAccess} disabled={loading}>
          {loading ? 'Chargement...' : 'Accéder'}
        </button>
        <p className="admin-hint">Code admin : <code>ADMIN2025</code></p>
        <footer>
          <h3>Merci à nos commanditaires :</h3>
          <ul className="sponsors">
            <li><a href="https://www.facebook.com/RPMHarleyDavidson" target="_blank" rel="noopener noreferrer">RPM Harley-Davidson</a></li>
            <li><a href="https://www.facebook.com/MicrobrasserieRiverbend" target="_blank" rel="noopener noreferrer">Microbrasserie Riverbend</a></li>
            <li><a href="https://www.facebook.com/FromagerieBoivin" target="_blank" rel="noopener noreferrer">Fromagerie Boivin</a></li>
            <li><a href="https://www.facebook.com/johell.kodak" target="_blank" rel="noopener noreferrer">JoHell Kodak</a></li>
            <li><a href="https://www.facebook.com/p.procyk" target="_blank" rel="noopener noreferrer">P. Procyk | Humain à tout faire</a></li>
            <li><a href="https://www.facebook.com/aglae.gagnon" target="_blank" rel="noopener noreferrer">Aglaé Gagnon Graphiste</a></li>
            <li><a href="https://www.facebook.com/awarvida" target="_blank" rel="noopener noreferrer">A&W Arvida</a></li>
            <li><a href="https://www.facebook.com/sportsvl" target="_blank" rel="noopener noreferrer">Sports VL</a></li>
            <li><a href="https://www.facebook.com/domainelecageot" target="_blank" rel="noopener noreferrer">Domaine Le Cageot</a></li>
            <li>Et tous les autres partenaires incroyables!</li>
          </ul>
        </footer>
      </div>
    );
  };

  // Admin Dashboard Page
  const AdminPage = () => {
    const handleLogout = () => {
      window.location.href = '/';
    };

    return (
      <>
        <AdminDashboard teams={teams} onLogout={handleLogout} />
        <MapInteractive />
      </>
    );
  };

  // Team Dashboard Page
  const TeamPage = ({ params }: { params: { code: string } }) => {
    const { code } = params;
    const handleLogout = () => {
      window.location.href = '/';
    };

    return (
      <>
        <TeamDashboard code={code} teams={teams} onLogout={handleLogout} />
        <MapInteractive />
      </>
    );
  };

  // Add path for current location to determine when to show NavBar
  const [location] = useLocation();
  const showNavBar = location !== '/' && location !== '/login';
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        {showNavBar && <NavBar />}
        <Switch>
          <Route path="/" component={IntroPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/team/:code" component={TeamPage} />
          <Route path="/team" component={() => {
            // Cette route est maintenant utilisée avec le paramètre code en query string
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            if (!code) {
              return <Redirect to="/login" />;
            }
            return <TeamDashboard code={code} teams={teams} onLogout={() => window.location.href = '/'} />;
          }} />
          <Route path="/team/upload" component={PhotoUploadPage} />
          <Route path="/team/photos" component={TeamPhotosPage} />
          <Route path="/public" component={() => <PublicDisplay teams={teams} />} />
          <Route path="/albums" component={FacebookAlbums} />
          <Route path="/participate" component={HowToParticipate} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/map" component={MapInteractive} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
