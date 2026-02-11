"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesDetailsDialogProps {
  species: Species;
  children: React.ReactNode; // This will be the trigger button
}

export default function SpeciesDetailsDialog({ species, children }: SpeciesDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{species.scientific_name}</DialogTitle>
          <DialogDescription>
            {species.common_name ? `Commonly known as ${species.common_name}` : "Species details"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {species.image && (
            <div className="relative h-64 w-full">
              <Image
                src={species.image}
                alt={species.scientific_name}
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
            </div>
          )}
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Scientific Name</h4>
              <p className="text-lg">{species.scientific_name}</p>
            </div>
            {species.common_name && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Common Name</h4>
                <p className="text-lg italic">{species.common_name}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Kingdom</h4>
              <p className="text-lg">{species.kingdom}</p>
            </div>
            {species.total_population !== null && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Total Population</h4>
                <p className="text-lg">{species.total_population.toLocaleString()}</p>
              </div>
            )}
            {species.description && (
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Description</h4>
                <p className="text-lg leading-relaxed">{species.description}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


