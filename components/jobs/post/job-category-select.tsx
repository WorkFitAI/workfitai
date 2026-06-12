"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { jobService } from "@/lib/job/job-service";
import { JobCategory } from "@/types/job";
import { UseFormReturn } from "react-hook-form";
import { JobFormValues } from "@/lib/schemas/job-schemas";

interface Props {
  form: UseFormReturn<JobFormValues>;
  job?: JobFormValues;
}

export default function JobCategorySelect({
  form,
  job,
}: Props) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await jobService.getAllCategories();
        setCategories(res.data.result || []);
      } catch (error) {
        console.error("Load categories failed:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!job?.jobCategoryName) return;

    form.setValue(
      "jobCategoryName",
      job.jobCategoryName,
      {
        shouldDirty: false,
        shouldValidate: false,
      }
    );
  }, [job, form]);

  const value = form.watch("jobCategoryName");

  const selectedCategory = categories.find(
    (c) => c.name === value
  );

  const filtered = categories.filter((c) =>
    c.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const exactMatch = categories.find(
    (c) =>
      c.name.trim().toLowerCase() ===
      search.trim().toLowerCase()
  );

  const handleCreateCategory = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);

      const res = await jobService.createCategory({
        name: search.trim(),
      });

      const newCategory =
        res.data ?? res.data;

      setCategories((prev) => [
        ...prev,
        newCategory,
      ]);

      form.setValue(
        "jobCategoryName",
        newCategory.name,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );

      setSearch("");
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="jobCategoryName"
      render={() => (
        <FormItem className="w-full">
          <FormLabel className="font-bold uppercase text-xs">
            Job Category
          </FormLabel>

          <Popover
            open={open}
            onOpenChange={setOpen}
          >
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-12"
                >
                  {selectedCategory?.name ||
                    value ||
                    "Select category..."}

                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent
              className="w-full p-0"
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
                    {filtered.map((c) => {
                      const isSelected =
                        c.name === value;

                      return (
                        <CommandItem
                          key={c.id}
                          value={c.name}
                          onSelect={() => {
                            form.setValue(
                              "jobCategoryName",
                              c.name,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              }
                            );

                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />

                          {c.name}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>

                  {search.trim() &&
                    !exactMatch && (
                      <div
                        className="flex items-center gap-2 p-3 border-t cursor-pointer hover:bg-muted"
                        onClick={
                          handleCreateCategory
                        }
                      >
                        <Plus className="h-4 w-4" />

                        <span>
                          {loading
                            ? "Creating..."
                            : `Create "${search}"`}
                        </span>
                      </div>
                    )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
}