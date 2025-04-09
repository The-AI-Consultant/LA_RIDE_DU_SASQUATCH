import ContactForm from "@/components/ContactForm";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Clock, Facebook, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <Phone className="h-5 w-5 text-primary" />,
      title: "Téléphone",
      content: "+1 (581) 123-4567",
    },
    {
      icon: <Mail className="h-5 w-5 text-primary" />,
      title: "Courriel",
      content: "info@sasquatchsag.org",
    },
    {
      icon: <Facebook className="h-5 w-5 text-[#1877F2]" />,
      title: "Facebook",
      content: "facebook.com/sasquatchsag",
      link: "https://www.facebook.com/sasquatchsag",
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-[#1877F2]" />,
      title: "Messenger",
      content: "Contactez-nous directement",
      link: "https://m.me/sasquatchsag",
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      title: "Adresse",
      content: "Saguenay, QC, Canada",
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "Heures de réponse",
      content: "Lun-Ven: 9h-17h",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-primary">Contactez-nous</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Nous sommes là pour répondre à toutes vos questions concernant La Ride du Sasquatch
        </p>
        <Separator className="my-6 max-w-md mx-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="space-y-8">
          <div className="content-section">
            <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((item, index) => (
                <Card key={index} className="hover-shadow">
                  <CardContent className="p-4 flex items-start space-x-4">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{item.content}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2 className="text-2xl font-bold mb-6">Foire aux questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Quand a lieu La Ride du Sasquatch?</h3>
                <p className="text-muted-foreground">
                  La prochaine édition de La Ride du Sasquatch aura lieu le 12 octobre 2025.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Comment puis-je m'inscrire?</h3>
                <p className="text-muted-foreground">
                  Les inscriptions se font via notre page de participation. Vous pouvez également nous contacter directement via Messenger.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Quel est le coût de participation?</h3>
                <p className="text-muted-foreground">
                  Le coût est de 50$ par équipe, peu importe le nombre de participants (entre 3 et 6).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Peut-on participer sans Facebook?</h3>
                <p className="text-muted-foreground">
                  Le chef d'équipe doit avoir un compte Facebook pour les communications importantes. Les autres membres de l'équipe n'ont pas besoin d'avoir un compte.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}