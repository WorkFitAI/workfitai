"use client";

import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, JobFormValues } from "@/lib/schemas/job-schemas";
import { 
  Briefcase, 
  FileText, 
  MapPin, 
  Calendar as CalendarIcon, 
  DollarSign, 
  GraduationCap, 
  Users, 
  Save, 
  Hash,
  Award
} from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useEffect, useMemo, useState } from "react";
import { Skill } from "@/types/skill";
import { jobService } from "@/lib/job/job-service";

type Props = {
  initialData?: JobFormValues;
  onSubmit: (data: JobFormValues) => void;
  onSuccess?: () => void;
};

export const JobForm = ({ initialData, onSubmit, onSuccess }: Props) => {

  const [skills, setSkills] = useState<Skill[]>([]);
  const [query, setQuery] = useState("");
  const [isPublished, setIsPublished] = useState(initialData?.status === "PUBLISHED");
  const isDeleted = initialData?.status === "CLOSED";

  const toggleStatus = async () => {
    const nextStatus = !isPublished;
    setIsPublished(nextStatus);
    await jobService.toggleJobStatus(initialData?.postId || "", nextStatus ? "PUBLISHED" : "DRAFT");
    onSuccess?.();
  };

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
      requiredExperience: "",
      companyNo: "",
      skillNames: [],
      expiresAt: new Date(),
      status: isPublished ? "PUBLISHED" : "DRAFT",
      ...initialData,
    },
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await jobService.getAllSkills();
        setSkills(res.data.result);
      } catch (err) {
        console.error("Error fetching skills", err);
      }
    };
    fetchSkills();
  }, []);

  const filtered = useMemo(() => {
    return skills.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, skills]);

  return (
    <Form {...form}>
      <form className="p-8 bg-slate-50/50 min-h-screen" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-w-[1600px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            
            {/* CỘT TRÁI */}
            <div className="space-y-8">
              
              {/* 1. THÔNG TIN CHUNG */}
              <Card className="shadow-sm border-none">
                <CardHeader className="border-b bg-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <Briefcase className="w-5 h-5" />
                      1. Basic Information
                    </CardTitle>
                    
                    {/* Toggle Status switch */}
                    {!isDeleted && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500">{isPublished ? "PUBLISHED" : "DRAFT"}</span>
                        <div
                          onClick={toggleStatus}
                          className={`relative w-14 h-7 rounded-full cursor-pointer transition-all ${isPublished ? "bg-green-500" : "bg-slate-300"}`}
                        >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-all ${isPublished ? "translate-x-7" : "translate-x-0"}`} />
                        </div>
                      </div>
                    )}
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold">Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Senior React Developer" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      disabled={!initialData}
                      control={form.control}
                      name="companyNo"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="font-semibold flex items-center gap-2">
                            <Hash className="w-4 h-4 text-slate-400" /> Company ID
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company reference number..." {...field} className="h-11" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between gap-6">
                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Employment Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl className="w-full md:w-[423px]">
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FULL_TIME">Full Time</SelectItem>
                              <SelectItem value="PART_TIME">Part Time</SelectItem>
                              <SelectItem value="CONTRACT">Contract</SelectItem>
                              <SelectItem value="INTERN">Intern</SelectItem>
                              <SelectItem value="REMOTE">Remote</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Experience Level</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl className="w-full md:w-[423px]">
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FRESHER">Fresher</SelectItem>
                              <SelectItem value="JUNIOR">Junior</SelectItem>
                              <SelectItem value="MID">Middle</SelectItem>
                              <SelectItem value="SENIOR">Senior</SelectItem>
                              <SelectItem value="LEAD">Leader</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="skillNames"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="font-semibold">Required Skills (Tags)</FormLabel>
                        <div className="flex flex-wrap gap-2 p-2.5 border rounded-lg bg-slate-50/50 min-h-[44px]">
                          {field.value.map((skill: string) => (
                            <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                              {skill}
                              <button type="button" onClick={() => field.onChange(field.value.filter((s: string) => s !== skill))} className="hover:text-red-200">✕</button>
                            </span>
                          ))}
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type skill and press Enter..."
                            className="flex-1 outline-none bg-transparent text-sm ml-2"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && query.trim()) {
                                e.preventDefault();
                                if (!field.value.includes(query)) field.onChange([...field.value, query]);
                                setQuery("");
                              }
                              if (e.key === "Backspace" && !query) field.onChange(field.value.slice(0, -1));
                            }}
                          />
                        </div>
                        {query && (
                          <Card className="absolute z-50 w-full mt-1 shadow-xl max-h-48 overflow-y-auto">
                            {filtered.map((skill) => (
                              <div key={skill.skillId} className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-none" onClick={() => {
                                if (!field.value.includes(skill.name)) field.onChange([...field.value, skill.name]);
                                setQuery("");
                              }}>{skill.name}</div>
                            ))}
                          </Card>
                        )}
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 2. MÔ TẢ & YÊU CẦU */}
              <Card className="shadow-sm border-none">
                <CardHeader className="border-b bg-white">
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <FileText className="w-5 h-5" />
                    2. Detailed Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6 bg-white">
                  <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Short Description</FormLabel>
                        <Textarea placeholder="Brief overview for job listing..." rows={2} {...field} />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Full Description</FormLabel>
                        <Textarea rows={6} {...field} />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-amber-700">Other Requirements</FormLabel>
                          <Textarea rows={4} {...field} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="benefits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold text-emerald-700">Benefits</FormLabel>
                          <Textarea rows={4} {...field} />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-2" />

                  {/* EDUCATION & EXPERIENCE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" /> Education Level
                          </FormLabel>
                          <Input placeholder="e.g. Bachelor in CS" {...field} className="h-11" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="requiredExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold flex items-center gap-2">
                            <Award className="w-4 h-4" /> Required Experience
                          </FormLabel>
                          <Input placeholder="e.g. 3-5 years" {...field} className="h-11" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CỘT PHẢI (SIDEBAR) */}
            <div className="space-y-6 lg:sticky lg:top-8 h-fit">
              <Card className="shadow-md border-t-4 border-t-blue-600">
                <CardHeader>
                  <CardTitle className="text-base uppercase tracking-wider text-slate-500 font-bold">Logistics & Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase">Min Salary</FormLabel>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input type="number" {...field} className="pl-9 h-10" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase">Max Salary</FormLabel>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <Input type="number" {...field} className="pl-9 h-10" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Location
                        </FormLabel>
                        <Input placeholder="City, Country" {...field} className="h-10" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase flex items-center gap-1">
                          <Users className="w-3 h-3" /> Hiring Quantity
                        </FormLabel>
                        <Input type="number" {...field} className="h-10" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs font-bold uppercase flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> Deadline <span className="text-red-500">(Date needs to be in future)</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 justify-start font-normal border-slate-200">
                              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                              {field.value ? field.value.toLocaleDateString() : "Set expiration"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]">
                    <Save className="w-5 h-5 mr-2" />
                    SAVE JOB POST
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}