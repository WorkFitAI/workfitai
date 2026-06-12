"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { jobService } from "@/lib/job/job-service";
import { JobCategory } from "@/types/job";

export default function FilterJobCategory() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategoryName =
    searchParams.get("categoryName") || "";

  const fetchCategories = async () => {
    try {
      const res = await jobService.getAllCategories();

      setCategories(res.data.result || []);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const updateCategoryFilter = (
    categoryName: string,
  ) => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("categoryName", categoryName);

    router.push(`?${params.toString()}`);
  };

  const clearCategoryFilter = () => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.delete("categoryName");

    router.push(`?${params.toString()}`);
  };

  const selectedCategory = categories.find(
    (c) => c.name === selectedCategoryName,
  );

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const exactMatch = categories.find(
    (c) =>
      c.name.trim().toLowerCase() ===
      search.trim().toLowerCase(),
  );

  const handleCreateCategory = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);

      const res = await jobService.createCategory({
        name: search.trim(),
      });

      const newCategory = res.data;

      setCategories((prev) => [
        ...prev,
        newCategory,
      ]);

      updateCategoryFilter(newCategory.name);

      setOpen(false);
      setSearch("");
    } catch (error) {
      console.error(
        "Create category error:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-8 mt-4">
      <h4 className="font-medium mb-3">
        Job Category
      </h4>

      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCategory
              ? selectedCategory.name
              : "Select category..."}

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[300px] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder="Search category..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList>
              <CommandEmpty>
                No category found.
              </CommandEmpty>

              <CommandGroup>
                {filtered.map((category, index) => (
                  <CommandItem
                    key={index}
                    value={category.name}
                    onSelect={() => {
                      updateCategoryFilter(
                        category.name,
                      );
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategoryName ===
                          category.name
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />

                    {category.name}
                  </CommandItem>
                ))}

                {search.trim() &&
                  !exactMatch && (
                    <CommandItem
                      onSelect={
                        handleCreateCategory
                      }
                      disabled={loading}
                    >
                      <Plus className="mr-2 h-4 w-4" />

                      {loading
                        ? "Creating..."
                        : `Create "${search}"`}
                    </CommandItem>
                  )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCategoryName && (
        <button
          onClick={clearCategoryFilter}
          className="mt-2 text-sm text-blue-500 hover:underline"
        >
          Clear category
        </button>
      )}
    </div>
  );
}