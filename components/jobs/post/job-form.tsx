"use client";

import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, JobFormValues } from "@/lib/schemas/job-schemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useEffect, useMemo, useState } from "react";
import { Skill } from "@/types/skill";

import { jobService } from "@/lib/job/job-service";

type Props = {
  initialData?:  JobFormValues;
  onSubmit: (data: JobFormValues) => void;
};

export function JobForm({ initialData, onSubmit }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [query, setQuery] = useState("");

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema) as Resolver<JobFormValues>,
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      employmentType: "FULL_TIME",
      experienceLevel: "SENIOR",
      salaryMin: 0,
      salaryMax: 0,
      currency: "USD",
      location: "",
      quantity: 1,
      requirements: "",
      responsibilities: "",
      benefits: "",
      educationLevel: "",
      skillNames: [],
      expiresAt: new Date(),
      ...initialData,
    },
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await jobService.getAllSkills();
        setSkills(res.data.result); 
      } catch (err) {
        console.error("Lỗi load skills", err);
      }
    };

    fetchSkills();
  }, []);

  const filtered = useMemo(() => {
    return skills.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, skills]);

  return (
  <Form {...form}>
    <form className="p-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* GRID CHÍNH */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          
          {/* LEFT */}
          <div className="space-y-6">
            
            {/* PHẦN 1 */}
            <div className="p-6 border rounded-xl bg-white shadow-sm space-y-4">
              <h2 className="font-semibold text-blue-600">
                1. Basic Information
              </h2>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Title</FormLabel>
                    <FormControl>
                      <Input id={field.name} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* employmentType */}
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Employment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-[423px]">
                          <SelectTrigger id={field.name}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">Full Time</SelectItem>
                          <SelectItem value="PART_TIME">Part Time</SelectItem>
                          <SelectItem value="CONTRACT">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* experience */}
                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Experience Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl className="w-[423px]">
                          <SelectTrigger id={field.name}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INTERN">Intern</SelectItem>
                          <SelectItem value="JUNIOR">Junior</SelectItem>
                          <SelectItem value="SENIOR">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skillNames"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel htmlFor={field.name}>Skills</FormLabel>

                      {/* TAGS */}
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md text-sm">
                        {field.value.map((skill: string) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() =>
                                field.onChange(
                                  field.value.filter((s: string) => s !== skill)
                                )
                              }
                            >
                              ✕
                            </button>
                          </span>
                        ))}

                      {/* INPUT */}
                      <input
                        id={field.name}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter skills..."
                        className="flex-1 outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && query.trim()) {
                            e.preventDefault();
                            if (!field.value.includes(query)) {
                              field.onChange([...field.value, query]);
                            }
                            setQuery("");
                          }

                          if (e.key === "Backspace" && !query) {
                            field.onChange(field.value.slice(0, -1));
                          }
                        }}
                      />
                    </div>

                    {/* DROPDOWN */}
                    {query && (
                      <div className="absolute z-50 w-full bg-white border mt-1 rounded shadow max-h-40 overflow-y-auto">
                        {filtered.map((skill) => (
                          <div
                            key={skill.skillId}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              if (!field.value.includes(skill.name)) {
                                field.onChange([...field.value, skill.name]);
                              }
                              setQuery("");
                            }}
                          >
                            {skill.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </FormItem>
                  )}
                />

              <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Quantity</FormLabel>
                      <Input id={field.name} type="number" {...field} />
                    </FormItem>
                  )}
              />
              </div>

              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Short Description</FormLabel>
                    <Textarea id={field.name} rows={3} {...field} />
                  </FormItem>
                )}
              />
            </div>

            {/* PHẦN 3 */}
            <div className="p-6 border rounded-xl bg-white shadow-sm space-y-4">
              <h2 className="font-semibold text-blue-600">
                3. Description & Requirements
              </h2>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Description</FormLabel>
                    <Textarea id={field.name} rows={4} {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Requirements</FormLabel>
                    <Textarea id={field.name} rows={3} {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Responsibilities</FormLabel>
                    <Textarea id={field.name} rows={3} {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Benefits</FormLabel>
                    <Textarea id={field.name} rows={3} {...field} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor={field.name}>Education Level</FormLabel>
                    <Textarea id={field.name} rows={3} {...field} />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6 lg:sticky lg:top-6 h-fit">
            <div className="p-6 border rounded-xl bg-white shadow-sm space-y-4">
              <h2 className="font-semibold text-blue-600">
                2. Salary & Deadline
              </h2>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Minimum Salary</FormLabel>
                      <Input id={field.name} type="number" {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Maximum Salary</FormLabel>
                      <Input id={field.name} type="number" {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Currency</FormLabel>
                      <Input id={field.name} {...field} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>Location</FormLabel>
                      <Input id={field.name} {...field} />
                    </FormItem>
                  )}
                />

                {/* DATE */}
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            {field.value
                              ? field.value.toLocaleDateString()
                              : "Select Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={field.name}>CompanyNo</FormLabel>
                      <Input id={field.name} {...field} />
                    </FormItem>
                  )}
                />
              
              </div>
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              className="w-full bg-blue-600 py-6 text-lg"
            >
              Save Job Post
            </Button>
          </div>
        </div>
      </div>
    </form>
  </Form>
);
}