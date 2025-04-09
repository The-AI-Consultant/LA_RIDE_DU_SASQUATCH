import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Menu, X, Home, Users, Camera, Calendar, LogIn, Facebook, MessageCircle, 
  MapPin, Target, Upload, Info, Trophy, HelpCircle, Map, BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const scrolled = false;

  // Fermer le menu en cas de clic sur le document
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Liens principaux de navigation
  const isAdmin = false; // Replace with actual auth check
  const isParticipant = false; // Replace with actual auth check

  const mainLinks = [
    { name: 'Accueil', path: '/', icon: <Home className="mr-2" size={16} />, always: true },
    { name: 'Tableau de bord', path: '/login', icon: <LogIn className="mr-2" size={16} />, guest: true }
  ];

  // Filter links based on user role
  const filteredMainLinks = mainLinks.filter(link => {
    if (link.always) return true;
    if (isAdmin) return !link.guest;
    if (isParticipant) return !link.guest;
    return link.guest;
  });

  // Liens du menu déroulant pour "Informations"
  const infoLinks = [
    { name: 'Classement', path: '/public', icon: <Trophy className="mr-2" size={16} /> },
    { name: 'Albums Photos', path: '/albums', icon: <Camera className="mr-2" size={16} /> },
    { name: 'Participation', path: '/participate', icon: <Calendar className="mr-2" size={16} /> },
    { name: 'Contact', path: '/contact', icon: <MessageCircle className="mr-2" size={16} /> },
    { name: 'Carte', path: '/map', icon: <Map className="mr-2" size={16} /> }
  ];

  // Liens pour les équipes (seront accessibles après connexion)
  const teamLinks = [
    { name: 'Mon équipe', path: '/team', icon: <Users className="mr-2" size={16} /> },
    { name: 'Soumettre une photo', path: '/team/upload', icon: <Upload className="mr-2" size={16} /> },
    { name: 'Défis', path: '/team/challenges', icon: <Target className="mr-2" size={16} /> }
  ];

  // Regroupement de tous les liens pour le menu mobile
  const allLinks = [...mainLinks, ...infoLinks];

  // Liens sociaux
  const socialLinks = [
    { name: 'Facebook', url: 'https://www.facebook.com/sasquatchsag', icon: <Facebook className="mr-2" size={16} /> },
    { name: 'Messenger', url: 'https://m.me/sasquatchsag', icon: <MessageCircle className="mr-2" size={16} /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-[#2b1500] to-[#3d1d00] text-white p-4 w-full shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer hover:opacity-90 transition-opacity">
              <div className="h-10 w-10 rounded-full bg-[#552b00] mr-3 flex items-center justify-center text-primary font-bold">
                LS
              </div>
              <h1 className="text-xl font-bold">La Ride du Sasquatch</h1>
            </div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#552b00] mr-2">
                <Facebook size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#3d1d00] border-[#552b00] text-white">
              <DropdownMenuLabel>Réseaux sociaux</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#552b00]" />
              {socialLinks.map((link) => (
                <DropdownMenuItem 
                  key={link.url} 
                  className="cursor-pointer hover:bg-[#552b00]"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  {link.icon}
                  {link.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-[#552b00]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-2">
          {/* Liens principaux */}
          {mainLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className={`flex items-center px-3 py-2 rounded hover:bg-[#552b00] transition-colors ${
                location === link.path ? 'border-b-2 border-[#f4c542]' : ''
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}

          {/* Menu déroulant d'informations */}
          {infoLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className="flex items-center px-3 py-2 rounded hover:bg-[#552b00]"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}

          {/* Liens pour l'équipe */}
          {teamLinks.map((link) => (
            <Link 
              key={link.path} 
              href={link.path}
              className="flex items-center px-3 py-2 rounded hover:bg-[#552b00]"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}

          {/* Liens sociaux */}
          <div className="ml-4 border-l border-[#552b00] pl-4 flex items-center">
            {socialLinks.map((link) => (
              <Button 
                key={link.url} 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-[#552b00]"
                onClick={() => window.open(link.url, '_blank')}
              >
                {link.name === 'Facebook' ? <Facebook size={18} /> : <MessageCircle size={18} />}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden backdrop-blur-lg bg-black/50 rounded-lg shadow-xl"> {/* Modified line */}
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#3d1d00] rounded-b-lg">
            {/* Section principale */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 uppercase font-bold px-3 mb-1">Navigation</p>
              {mainLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center px-3 py-2 rounded hover:bg-[#552b00] transition-colors ${
                    location === link.path ? 'bg-[#552b00] border-l-4 border-[#f4c542]' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Section informations */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 uppercase font-bold px-3 mb-1">Informations</p>
              {infoLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center px-3 py-2 rounded hover:bg-[#552b00] transition-colors ${
                    location === link.path ? 'bg-[#552b00] border-l-4 border-[#f4c542]' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Section équipe */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 uppercase font-bold px-3 mb-1">Mon équipe</p>
              {teamLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center px-3 py-2 rounded hover:bg-[#552b00] transition-colors ${
                    location === link.path ? 'bg-[#552b00] border-l-4 border-[#f4c542]' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Section réseaux sociaux */}
            <div className="mb-1">
              <p className="text-xs text-gray-400 uppercase font-bold px-3 mb-1">Réseaux sociaux</p>
              <div className="flex px-3 space-x-2">
                {socialLinks.map((link) => (
                  <Button
                    key={link.url}
                    variant="outline"
                    size="sm"
                    className="bg-[#552b00] text-white hover:bg-[#6b3800] border-[#6b3800]"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    {link.icon}
                    {link.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;