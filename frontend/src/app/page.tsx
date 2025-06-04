"use client"

import { Car, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getAvailableGenomes, getGenomeChromosomes, type ChromosomeFromSearch, type GenomeAssemblyFromSearch } from "~/utils/genome-api";

type Mode = "browse" | "search";

export default function HomePage() {
  const [genomes, setGenomes] = useState<GenomeAssemblyFromSearch[]>([]);
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");
  const [searchQuery, setSearchQuery] = useState("");
  const [chromosomes, setChromosomes] = useState<ChromosomeFromSearch[]>([]);
  const [selectedChromosome, setSelectedChromosome] = useState<string>("chr1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("search");

  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableGenomes();
        if (data.genomes && data.genomes["Human"]) {
          setGenomes(data.genomes["Human"]);
        }
      } catch (err) {
        setError("Failed to load genome data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenomes();
  }, []);

   useEffect(() => {
    const fetchChromosomes = async () => {
      try {
        setIsLoading(true);
        const data = await getGenomeChromosomes(selectedGenome);
        setChromosomes(data.chromosomes);
        console.log(data.chromosomes);
        if (data.chromosomes.length > 0) {
          setSelectedChromosome(data.chromosomes[0]!.name);
        }
      } catch (err) {
        setError("Failed to load chromosome data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChromosomes();
  }, [selectedGenome]);


  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
  }

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    
    setMode(newMode);
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;


  }

  const loadCRCA1Example = () => {
    setMode("search");
    setSearchQuery("BRCA1");
    handleSearch();
  }
  
  return (
    <div className="min-h-screen bg-[#e9eeea]">
      <header className="border border-[#3c4f3d]/10 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h1 className="text-xl font-light tracking-wide text-[#3c4f3d]">
                <span className="font-normal">EVO</span>
                <span className="text-[#de8246]">2</span>
              </h1>
              <div className="absolute -bottom-1 left-0 h-[2px] w-12 bg-[#de8246]"></div>
            </div>
            <span className="text-sm font-light text-[#3c4f3d]/70">
              Variant Analysis
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <Card className="mb-6 gap-0 border-none bg-white py-0 shadow-sm">
          <CardHeader className="pt-4 mb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-normal text-[#3c4f3d]/70">
                Genome Assembly
              </CardTitle>
              <div className="text-sm text-[#3c4f3d]/60">
                Organism: <span className="font-medium">Human</span>
              </div>
            </div>
          </CardHeader>
           <CardContent className="pb-4">
            <Select
              value={selectedGenome}
              onValueChange={handleGenomeChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 w-full border-[#3c4f3d]/10">
                <SelectValue placeholder="Select genome assembly" />
              </SelectTrigger>
              <SelectContent>
                {genomes.map((genome) => (
                  <SelectItem key={genome.id} value={genome.id}>
                    {genome.id} - {genome.name}
                    {genome.active ? " (active)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGenome && (
              <p className="mt-2 text-xs text-[#3c4f3d]/60">
                {
                  genomes.find((genome) => genome.id === selectedGenome)
                    ?.sourceName
                }
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6 gap-0 border-none bg-white py-0 shadow-sm">
          <CardHeader className="pt-4 pb-2">
            <CardTitle className="text-sm font-normal text-[#3c4f3d]/70">
              Browse
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <Tabs
              value={mode}
              onValueChange={(value) => switchMode(value as Mode)}  
            >
              <TabsList className="mb-4 bg-[#e9eeea]">
                <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-[#3c4f3d]" value="search">
                  Search Genes
                </TabsTrigger>
                <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-[#3c4f3d]" value="browse">
                  Browse Chromosomes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-0">
                <div className="space-y-4">
                  <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Input 
                        type="text"
                        placeholder="Enter gene symbol or name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 border-[#3c4f3d]/10 pr-10"
                      />
                      <Button
                        type="submit"
                        className="absolute top-0 right-0 h-full cursor-pointer rounded-l-none bg-[#3c4f3d] text-white hover:bg-[#3c4f3d]/90"
                        disabled={isLoading || !searchQuery.trim()}
                        size="icon"
                      >
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                      </Button>
                    </div>
                  </form>
                  <Button onClick={loadCRCA1Example} variant="link" className="h-auto cursor-pointer p-0 text-[#de8246] hover:text-[#de8246]/80">
                    Try BRACA1 example
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="browse" className="mt-0">
                <div className="max-h-[150px] overflow-y-auto pr-1">
                  <div className="flex flex-wrap gap-2">
                    {chromosomes.map((chrom) => (
                      <Button
                        key={chrom.name}
                        variant="outline"
                        size="sm"
                        className={`h-8 px-3 font-normal hover:text-[#3c4f3d] ${selectedChromosome === chrom.name ? "bg-[#e9eeea] text-[#3c4f3d]" : ""}`}
                        onClick={() => setSelectedChromosome(chrom.name)}
                      >
                        {chrom.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3c4f3d]/30 border-t-[#de8243]"></div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
