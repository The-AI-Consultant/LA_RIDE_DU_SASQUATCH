import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Challenge, Team } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Camera, Upload, Image as ImageIcon, CheckCheck, X } from 'lucide-react';

interface PhotoUploadProps {
  team: Team;
  challenges: Challenge[];
}

const PhotoUpload = ({ team, challenges }: PhotoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximum est de 5 MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleChallengeChange = (value: string) => {
    setChallengeId(value);
  };
  
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !challengeId) {
        throw new Error("Veuillez sélectionner une photo et un défi");
      }
      
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('teamId', team.id.toString());
      formData.append('challengeId', challengeId);
      
      if (notes) {
        formData.append('notes', notes);
      }
      
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors du téléchargement");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setChallengeId('');
      setNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Show success message
      toast({
        title: "Photo téléchargée avec succès",
        description: "Votre photo a été envoyée et est en attente d'approbation",
        variant: "default",
      });
      
      // Invalidate photos query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${team.id}/photos`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec du téléchargement",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Aucune photo sélectionnée",
        description: "Veuillez choisir une photo à télécharger",
        variant: "destructive",
      });
      return;
    }
    
    if (!challengeId) {
      toast({
        title: "Aucun défi sélectionné",
        description: "Veuillez sélectionner un défi pour cette photo",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    uploadMutation.mutate();
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const filteredChallenges = challenges.filter(c => c.type === 'photo');
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-6 w-6" />
          Soumettre une photo de défi
        </CardTitle>
        <CardDescription>
          Téléchargez une photo pour valider un défi et gagner des points pour votre équipe
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Challenge selection */}
          <div className="space-y-2">
            <Label htmlFor="challenge">Défi à valider</Label>
            <Select value={challengeId} onValueChange={handleChallengeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un défi" />
              </SelectTrigger>
              <SelectContent>
                {filteredChallenges.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id.toString()}>
                    {challenge.name} ({challenge.points} points)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* File upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="grid gap-4">
              {!preview ? (
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center min-h-[200px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">Cliquez pour choisir une photo</p>
                  <p className="text-sm text-muted-foreground">ou glissez-déposez une image (JPG, PNG)</p>
                  <p className="text-xs text-muted-foreground mt-2">Taille maximum: 5 MB</p>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-auto max-h-[300px] rounded-lg object-contain bg-muted/50"
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 rounded-full"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Input
                ref={fileInputRef}
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes ou une description pour cette photo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemoveFile}
            disabled={!selectedFile || isSubmitting}
          >
            Réinitialiser
          </Button>
          
          <Button
            type="submit"
            disabled={!selectedFile || !challengeId || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>Téléchargement en cours...</>
            ) : (
              <>
                <CheckCheck className="h-4 w-4" />
                Soumettre la photo
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PhotoUpload;