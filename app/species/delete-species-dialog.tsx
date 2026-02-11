"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Species = Database["public"]["Tables"]["species"]["Row"];

interface DeleteSpeciesDialogProps {
  species: Species;
  sessionId: string;
}

export default function DeleteSpeciesDialog({ species, sessionId }: DeleteSpeciesDialogProps) {
  const router = useRouter();

  // Control open/closed state of the dialog
  const [open, setOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Verify that the current user is the author of this species
  // Use strict comparison and ensure both are strings
  const isAuthor = String(species.author) === String(sessionId);

  // If the user is not the author, don't render the dialog at all
  if (!isAuthor) {
    return null;
  }

  const handleDelete = async () => {
    // Double-check authorization before deleting (defense in depth)
    if (String(species.author) !== String(sessionId)) {
      return toast({
        title: "Unauthorized",
        description: "You can only delete species that you have created.",
        variant: "destructive",
      });
    }

    setIsDeleting(true);

    // Delete the species from Supabase
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .delete()
      .eq("id", species.id)
      .eq("author", sessionId); // Additional safeguard: only delete if author matches

    setIsDeleting(false);

    // Catch and report errors from Supabase
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    // Close the dialog
    setOpen(false);

    // Refresh all server components in the current route to update the species list
    router.refresh();

    return toast({
      title: "Species deleted!",
      description: "Successfully deleted " + species.scientific_name + ".",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Species</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{species.scientific_name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

