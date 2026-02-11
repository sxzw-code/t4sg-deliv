"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import type { Database } from "@/lib/schema";
import { Search } from "lucide-react";
import { useState } from "react";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCard from "./species-card";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesListClientProps {
  species: Species[];
  sessionId: string;
}

export default function SpeciesListClient({ species, sessionId }: SpeciesListClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter species based on search query (case-insensitive)
  const filteredSpecies = species.filter((s) => {
    if (!searchQuery.trim()) {
      return true; // Show all species if search is empty
    }

    const query = searchQuery.toLowerCase().trim();

    // Check if search query matches scientific name, common name, or description
    const matchesScientificName = s.scientific_name?.toLowerCase().includes(query) ?? false;
    const matchesCommonName = s.common_name?.toLowerCase().includes(query) ?? false;
    const matchesDescription = s.description?.toLowerCase().includes(query) ?? false;

    return matchesScientificName || matchesCommonName || matchesDescription;
  });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species List</TypographyH2>
        <AddSpeciesDialog userId={sessionId} />
      </div>
      <Separator className="my-4" />
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by scientific name, common name, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-muted-foreground">
            {filteredSpecies.length} {filteredSpecies.length === 1 ? "species" : "species"} found
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center">
        {filteredSpecies.length > 0 ? (
          filteredSpecies.map((species) => (
            <SpeciesCard key={species.id} species={species} sessionId={sessionId} />
          ))
        ) : (
          <div className="w-full py-8 text-center text-muted-foreground">
            <p>No species found matching your search.</p>
          </div>
        )}
      </div>
    </>
  );
}

