import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Send, MessageCircle } from 'lucide-react';

const ContactForm = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simuler un délai d'envoi
    setTimeout(() => {
      toast({
        title: "Message envoyé!",
        description: "Nous vous répondrons dans les plus brefs délais.",
        variant: "default",
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Réinitialiser le formulaire
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      
      // Réinitialiser l'état de soumission après quelques secondes
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md border-2 border-[#3d1d00]">
      <CardHeader className="bg-gradient-to-r from-[#3d1d00] to-[#552b00] text-white">
        <CardTitle className="text-xl">Nous contacter</CardTitle>
        <CardDescription className="text-gray-200">
          Une question? Envoyez-nous un message!
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Message envoyé avec succès!</h3>
            <p className="text-muted-foreground">
              Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Votre nom"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="focus:border-primary focus:ring-primary"
                />
              </div>
              
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
                  disabled={isSubmitting}
                  className="focus:border-primary focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet *</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Sujet de votre message"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="focus:border-primary focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Votre message..."
                  value={formState.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  rows={4}
                  className="focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 bg-gray-50 rounded-b-lg pt-4">
        {!isSubmitted && (
          <div className="flex flex-col xs:flex-row gap-4 w-full">
            <Button 
              className="flex-1 btn-interactive text-black"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 flex gap-2 items-center"
              onClick={() => window.open('https://m.me/sasquatchsag', '_blank')}
              disabled={isSubmitting}
            >
              <MessageCircle size={16} />
              Messenger
            </Button>
          </div>
        )}
        <div className="text-xs text-muted-foreground text-center">
          * Champs obligatoires
        </div>
      </CardFooter>
    </Card>
  );
};

export default ContactForm;