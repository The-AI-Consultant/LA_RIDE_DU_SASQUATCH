import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Facebook, 
  MessageCircle, 
  Users 
} from 'lucide-react';

const HowToParticipate = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    teamName: '',
    captainName: '',
    email: '',
    phone: '',
    facebookProfile: '',
    memberCount: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire
    if (!formState.teamName || !formState.captainName || !formState.email || !formState.phone || !formState.facebookProfile) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    // Simuler l'envoi du formulaire
    toast({
      title: "Demande d'inscription envoyée!",
      description: "Un administrateur vous contactera sur Facebook Messenger pour finaliser le paiement et l'inscription.",
      variant: "default",
    });
    
    // Réinitialiser le formulaire
    setFormState({
      teamName: '',
      captainName: '',
      email: '',
      phone: '',
      facebookProfile: '',
      memberCount: '',
      message: '',
    });
  };

  const regulations = [
    {
      title: "Composition des équipes",
      content: "Chaque équipe doit être composée de 3 à 6 membres. Une équipe avec moins de 3 membres ou plus de 6 membres ne pourra pas participer pour des raisons de sécurité et d'équité dans la compétition."
    },
    {
      title: "Facebook obligatoire pour le chef d'équipe",
      content: "Le chef d'équipe doit avoir un compte Facebook actif. Toutes les communications importantes se feront via Messenger, et les annonces seront publiées sur notre page Facebook officielle."
    },
    {
      title: "Inscriptions et paiement",
      content: "L'inscription n'est complète qu'après réception du paiement. Une fois votre demande d'inscription soumise, un administrateur vous contactera via Messenger pour organiser le paiement."
    },
    {
      title: "Respect des règlements du rallye",
      content: "Tous les participants doivent suivre les règlements détaillés qui seront fournis le jour de l'événement. Cela inclut des règles de sécurité, le respect du timing, et les directives pour chaque défi."
    },
    {
      title: "Comportement et fair-play",
      content: "Nous attendons de tous les participants qu'ils fassent preuve de sportivité et de respect envers les autres équipes, les bénévoles et les partenaires de l'événement. Tout comportement antisportif peut entraîner une disqualification."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="content-section">
          <h1 className="text-4xl font-bold mb-4 text-primary">Comment Participer</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez comment vous pouvez rejoindre l'aventure La Ride du Sasquatch et vivre une expérience unique dans la région du Saguenay-Lac-Saint-Jean
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <AlertCircle className="mr-2 text-[#f4c542]" />
            Règlements à connaître
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            {regulations.map((reg, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">
                  {reg.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {reg.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold">Points clés à retenir:</h3>
            
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">Équipes de 3 à 6 personnes</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">Le chef d'équipe doit avoir un compte Facebook</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">Inscription confirmée après paiement</p>
            </div>
            
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">Suivre les règles détaillées le jour de l'événement</p>
            </div>
          </div>

          <div className="mt-8 bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <Calendar className="mr-2 text-[#f4c542]" />
              Dates importantes
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="font-semibold min-w-[180px]">Ouverture des inscriptions:</span>
                <span>15 juillet 2025</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold min-w-[180px]">Clôture des inscriptions:</span>
                <span>15 septembre 2025</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold min-w-[180px]">Date de l'événement:</span>
                <span>Entre le 12 et 31 octobre 2025 (date à confirmer)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold min-w-[180px]">Lieu de départ:</span>
                <span>Domain le Cajot (à confirmer)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold min-w-[180px]">Soirée "party":</span>
                <span>10$ supplémentaire par personne</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <Card className="border-2 border-[#3d1d00]">
            <CardHeader className="bg-gradient-to-r from-[#3d1d00] to-[#552b00] text-white">
              <CardTitle className="text-2xl">Formulaire d'inscription</CardTitle>
              <CardDescription className="text-gray-200">
                Remplissez ce formulaire pour vous inscrire à La Ride du Sasquatch
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Nom de l'équipe *</Label>
                    <Input
                      id="teamName"
                      name="teamName"
                      placeholder="Les Chasseurs de Sasquatch"
                      value={formState.teamName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="captainName">Nom du chef d'équipe *</Label>
                    <Input
                      id="captainName"
                      name="captainName"
                      placeholder="Prénom et nom"
                      value={formState.captainName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Courriel *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formState.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="(123) 456-7890"
                        value={formState.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="facebookProfile" className="flex items-center">
                      <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />
                      Profil Facebook du chef d'équipe *
                    </Label>
                    <Input
                      id="facebookProfile"
                      name="facebookProfile"
                      placeholder="facebook.com/votrenom"
                      value={formState.facebookProfile}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Obligatoire pour les communications via Messenger
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="memberCount" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Nombre de participants dans votre équipe
                    </Label>
                    <Input
                      id="memberCount"
                      name="memberCount"
                      type="number"
                      min="3"
                      max="6"
                      placeholder="3-6 membres"
                      value={formState.memberCount}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (optionnel)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Questions ou commentaires supplémentaires"
                      value={formState.message}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 bg-gray-50 rounded-b-lg pt-4">
              <div className="text-sm text-muted-foreground">
                <p>* Champs obligatoires</p>
                <p className="mt-1">
                  Après soumission, un administrateur vous contactera via Messenger pour finaliser le paiement.
                </p>
              </div>
              <div className="flex flex-col xs:flex-row gap-4 w-full">
                <Button 
                  className="flex-1 btn-interactive text-black"
                  onClick={handleSubmit}
                >
                  <span className="relative z-10">Soumettre l'inscription</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 flex gap-2 items-center"
                  onClick={() => window.open('https://m.me/LarideduSasquatch', '_blank')}
                >
                  <MessageCircle size={16} />
                  Contacter via Messenger
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="mt-8 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Note importante</h3>
            <p className="text-yellow-700">
              Les places sont limitées! Les inscriptions sont acceptées selon le principe du premier arrivé, premier servi. 
              Assurez-vous de compléter votre paiement rapidement après avoir été contacté pour garantir votre place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToParticipate;