
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import videoIntroSrc from '@assets/Video Intro La Ride Du Sasquatch.mp4';

interface IntroPageProps {}

export default function IntroPage() {
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Handler for when video ends
  const handleVideoEnded = () => {
    setVideoPlayed(true);
  };
  
  // Handler for when video loads
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  useEffect(() => {
    // Check if the video exists
    const videoElement = document.getElementById('intro-video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.addEventListener('loadeddata', handleVideoLoaded);
      return () => {
        videoElement.removeEventListener('loadeddata', handleVideoLoaded);
      };
    }
  }, []);

  return (
    <div className="intro-screen overflow-y-auto">
      <div className="intro-content relative min-h-screen py-8" style={{ 
        backgroundImage: 'url("/path/to/bg.jpg")',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
          <h1 className="text-3xl font-bold mb-4 text-primary">
            Bienvenue à La Ride du Sasquatch!
          </h1>
          
          <p className="mb-6 text-lg">
            Préparez-vous pour une aventure extraordinaire à travers la région du Saguenay-Lac-Saint-Jean!
          </p>
          
          <div className="intro-video-container">
            <video 
              id="intro-video"
              className="intro-video"
              controls
              width="100%"
              autoPlay
              onEnded={handleVideoEnded}
            >
              <source src={videoIntroSrc} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center my-6">
            <Button
              onClick={() => window.location.href = '/public'}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Découvrir l'événement
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = '/login'}
              className="border-primary text-primary hover:bg-primary/10"
            >
              Accès membres / Admin
            </Button>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Le concept en bref:</h2>
            <ul className="list-disc pl-6 space-y-2 text-left mb-6">
              <li>Un rallye d'aventure unique au Saguenay-Lac-Saint-Jean</li>
              <li>Des défis photos aux quatre coins de la région</li>
              <li>Un tableau de bord en temps réel pour suivre votre progression</li>
              <li>Des points à gagner pour chaque défi réussi</li>
              <li>Une expérience mémorable entre amis</li>
            </ul>
            <p className="mt-4 text-sm">
              <a href="/participate" className="text-primary hover:underline">Consultez la page d'inscription</a> pour connaître tous les détails sur la composition des équipes et les règlements officiels.
            </p>
          </div>
          
          <div className="intro-buttons mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://www.facebook.com/sasquatchsag', '_blank')}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Facebook officiel <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
