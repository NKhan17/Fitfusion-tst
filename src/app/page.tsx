"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Cloud,
  Frown,
  Heart,
  Loader2,
  Music,
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
import { interpretMoodFromText } from "@/ai/flows/interpret-mood-from-text";
import {
  suggestOutfit,
  type SuggestOutfitOutput,
} from "@/ai/flows/suggest-outfit-from-mood-event-weather";
import { wardrobe } from "@/lib/wardrobe";
import { FitFusionLogo } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

const moodOptions = [
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
];

export default function Home() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodText, setMoodText] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [weather, setWeather] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [outfit, setOutfit] = useState<SuggestOutfitOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedMood && !moodText) || !selectedEvent || !weather) {
      toast({
        title: "Missing Information",
        description: "Please select a mood, event, and enter the weather.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setOutfit(null);

    try {
      let finalMood = selectedMood;

      if (moodText) {
        const interpretation = await interpretMoodFromText({ text: moodText });
        finalMood = interpretation.moodCategory;
        if (moodOptions.some(m => m.value === finalMood)) {
            setSelectedMood(finalMood);
        }
      }

      if (!finalMood) {
        toast({
            title: "Mood not clear",
            description: "Could not determine mood from text. Please select a tag.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const suggestion = await suggestOutfit({
        mood: finalMood,
        event: selectedEvent,
        weather,
        wardrobe: JSON.stringify(wardrobe),
      });

      setOutfit(suggestion);
    } catch (error) {
      console.error("Error getting outfit suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to get outfit suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                <Label>How are you feeling?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {moodOptions.map((mood) => (
                    <Button
                      key={mood.value}
                      type="button"
                      variant={selectedMood === mood.value ? "default" : "outline"}
                      onClick={() => {
                        setSelectedMood(mood.value);
                        setMoodText("");
                      }}
                      className="flex items-center justify-center gap-2"
                    >
                      {mood.icon}
                      <span>{mood.label}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground my-2">OR</p>
                <Textarea
                  placeholder="Describe your mood in a sentence..."
                  value={moodText}
                  onChange={(e) => {
                    setMoodText(e.target.value);
                    setSelectedMood(null);
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
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fusing Your Fit...
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
                        <Badge variant="secondary" className="capitalize ml-4">{outfit.moodTag}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-2 group">
                            <Image src="https://placehold.co/400x600.png" alt="Top" width={400} height={600} className="rounded-lg object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105" data-ai-hint="fashion top" />
                            <p className="text-center text-sm font-medium">Top</p>
                        </div>
                        <div className="space-y-2 group">
                            <Image src="https://placehold.co/400x600.png" alt="Bottom" width={400} height={600} className="rounded-lg object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105" data-ai-hint="fashion bottom" />
                            <p className="text-center text-sm font-medium">Bottom</p>
                        </div>
                        <div className="space-y-2 group">
                             <Image src="https://placehold.co/400x600.png" alt="Footwear" width={400} height={600} className="rounded-lg object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105" data-ai-hint="fashion footwear" />
                            <p className="text-center text-sm font-medium">Footwear</p>
                        </div>
                        <div className="space-y-2 group">
                            <Image src="https://placehold.co/400x600.png" alt="Accessory" width={400} height={600} className="rounded-lg object-cover aspect-[2/3] transition-transform duration-300 group-hover:scale-105" data-ai-hint="fashion accessory" />
                            <p className="text-center text-sm font-medium">Accessory</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
