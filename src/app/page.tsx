"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Briefcase,
  Cloud,
  Coffee,
  Dumbbell,
  Frown,
  Heart,
  Loader2,
  Music,
  PartyPopper,
  RefreshCw,
  Smile,
  Sparkles,
  Users,
  Wind,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { interpretVibeFromText } from "@/ai/flows/interpret-mood-from-text";
import {
  suggestOutfit,
  type SuggestOutfitOutput,
} from "@/ai/flows/suggest-outfit-from-mood-event-weather";
import { generateOutfitImage } from "@/ai/flows/generate-outfit-image";
import { wardrobe } from "@/lib/wardrobe";
import { FitFusionLogo } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const vibeOptions = [
  { value: "happy", label: "Happy", icon: <Smile className="size-5" /> },
  { value: "moody", label: "Moody", icon: <Frown className="size-5" /> },
  { value: "chaotic", label: "Chaotic", icon: <Zap className="size-5" /> },
  { value: "calm", label: "Calm", icon: <Wind className="size-5" /> },
  { value: "dreamy", label: "Dreamy", icon: <Cloud className="size-5" /> },
  { value: "confident", label: "Confident", icon: <Sparkles className="size-5" /> },
];

const eventOptions = [
  { value: "date", label: "Date", icon: <Heart className="size-4" /> },
  { value: "exam", label: "Exam", icon: <BookOpen className="size-4" /> },
  { value: "fest", label: "Fest", icon: <Music className="size-4" /> },
  { value: "casual hangout", label: "Casual Hangout", icon: <Users className="size-4" /> },
  { value: "work", label: "Work", icon: <Briefcase className="size-4" /> },
  { value: "party", label: "Party", icon: <PartyPopper className="size-4" /> },
  { value: "brunch", label: "Brunch", icon: <Coffee className="size-4" /> },
  { value: "workout", label: "Workout", icon: <Dumbbell className="size-4" /> },
];

interface SuggestionInputs {
  vibe: string;
  event: string;
  weather: string;
}

export default function Home() {
  const { toast } = useToast();
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [vibeText, setVibeText] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [weather, setWeather] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isSuggestingAgain, setIsSuggestingAgain] = useState(false);
  const [outfit, setOutfit] = useState<SuggestOutfitOutput | null>(null);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([]);
  const [lastSuggestionInputs, setLastSuggestionInputs] = useState<SuggestionInputs | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedVibe && !vibeText) || !selectedEvent || !weather) {
      toast({
        title: "Missing Information",
        description: "Please select a vibe, event, and enter the weather.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setOutfit(null);
    setImageUrls([]);
    setIsGeneratingImages(false);
    setLastSuggestionInputs(null);

    try {
      let finalVibe = selectedVibe;

      if (vibeText) {
        const interpretation = await interpretVibeFromText({ text: vibeText });
        finalVibe = interpretation.vibeCategory;
        if (vibeOptions.some(v => v.value === finalVibe)) {
            setSelectedVibe(finalVibe);
        }
      }

      if (!finalVibe) {
        toast({
            title: "Vibe not clear",
            description: "Could not determine vibe from text. Please select a tag.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const currentInputs = { vibe: finalVibe, event: selectedEvent, weather };
      setLastSuggestionInputs(currentInputs);

      const suggestion = await suggestOutfit({
        ...currentInputs,
        wardrobe: JSON.stringify(wardrobe),
      });
      setOutfit(suggestion);
      setIsLoading(false); 

      setIsGeneratingImages(true);
      const imagePromises = suggestion.items.map(item =>
        generateOutfitImage(item.description)
      );
      const imageResults = await Promise.all(imagePromises);
      setImageUrls(imageResults.map(r => r.imageUrl));

    } catch (error) {
      console.error("Error during outfit generation process:", error);
      toast({
        title: "Error",
        description: "Failed to get outfit suggestion or generate images. Please try again.",
        variant: "destructive",
      });
      setLastSuggestionInputs(null);
      setIsLoading(false);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleSuggestAgain = async () => {
    if (!lastSuggestionInputs) return;

    setIsSuggestingAgain(true);
    setImageUrls([]); // Clear images to show skeletons
    setIsGeneratingImages(true);

    try {
      const suggestion = await suggestOutfit({
        ...lastSuggestionInputs,
        wardrobe: JSON.stringify(wardrobe),
      });
      setOutfit(suggestion);

      const imagePromises = suggestion.items.map(item =>
        generateOutfitImage(item.description)
      );
      const imageResults = await Promise.all(imagePromises);
      setImageUrls(imageResults.map(r => r.imageUrl));
    } catch (error) {
      console.error("Error on suggesting again:", error);
      toast({
        title: "Error",
        description: "Failed to get another suggestion. Please try again.",
        variant: "destructive",
      });
      setOutfit(null);
      setLastSuggestionInputs(null);
    } finally {
      setIsSuggestingAgain(false);
      setIsGeneratingImages(false);
    }
  };

  const isAnyLoading = isLoading || isGeneratingImages || isSuggestingAgain;

  return (
    <div className="flex flex-col items-center w-full min-h-full bg-grid-gray-100/[0.1] p-4 md:p-8">
      <header className="flex items-center gap-3 mb-8">
        <FitFusionLogo className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-center font-headline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          FitFusion
        </h1>
      </header>

      <main className="w-full max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Find Your Perfect Outfit</CardTitle>
              <CardDescription>
                Tell us your vibe, and we&apos;ll suggest what to wear.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>What&apos;s your vibe?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {vibeOptions.map((vibe) => (
                    <Button
                      key={vibe.value}
                      type="button"
                      variant={selectedVibe === vibe.value ? "default" : "outline"}
                      onClick={() => {
                        setSelectedVibe(vibe.value);
                        setVibeText("");
                      }}
                      className="flex items-center justify-center gap-2"
                    >
                      {vibe.icon}
                      <span>{vibe.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground my-2">OR</p>
                <Textarea
                  placeholder="Describe your vibe in a sentence..."
                  value={vibeText}
                  onChange={(e) => {
                    setVibeText(e.target.value);
                    setSelectedVibe(null);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event">What&apos;s the occasion?</Label>
                  <Select onValueChange={setSelectedEvent} value={selectedEvent}>
                    <SelectTrigger id="event">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventOptions.map((event) => (
                        <SelectItem key={event.value} value={event.value}>
                          <div className="flex items-center gap-2">
                            {event.icon}
                            <span>{event.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weather">What&apos;s the weather like?</Label>
                  <Input
                    id="weather"
                    placeholder="e.g., sunny, rainy, cold"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isAnyLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fusing Your Fit...
                  </>
                ) : isGeneratingImages ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Images...
                  </>
                ) : (
                  "Get Suggestion"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {outfit && (
          <div className="mt-8 animate-in fade-in-50 duration-500">
            <Card className="shadow-lg overflow-hidden">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-headline">{outfit.outfitName}</CardTitle>
                            <CardDescription className="mt-2">{outfit.explanation}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="capitalize ml-4">{outfit.vibeTag}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(outfit.items || []).map((item, index) => (
                           <div key={item.category} className="space-y-2 group">
                                <div className="aspect-[2/3] w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                  {imageUrls[index] ? (
                                      <Image 
                                          src={imageUrls[index]!} 
                                          alt={item.category} 
                                          width={400} 
                                          height={600} 
                                          className="rounded-lg object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                      />
                                  ) : (
                                      <Skeleton className="w-full h-full rounded-lg" />
                                  )}
                                </div>
                                <p className="text-center text-sm font-medium">{item.category}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
                {lastSuggestionInputs && (
                  <CardFooter className="justify-center border-t pt-6">
                    <Button
                      variant="outline"
                      onClick={handleSuggestAgain}
                      disabled={isAnyLoading}
                    >
                      {isSuggestingAgain ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Getting another...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Suggest Something Else
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
