/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Globe,
  MapPin,
  Upload,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { Company } from "@/types/company";
import { companyService } from "@/lib/company/company-service";

import { toast } from "sonner"

interface Props {
  company: Company | null;
  canEdit?: boolean;
}

const CompanyDetail = ({ company, canEdit = false }: Props) => {
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    description: "",
    address: "",
    websiteUrl: "",
    size: "",
  });

  useEffect(() => {
    if (!company) return;

    setPreview(company.logoUrl || "");
    setForm({
      description: company.description || "",
      address: company.address || "",
      websiteUrl: company.websiteUrl || "",
      size: String(company.size) || "",
    });
  }, [company]);

  if (!company) return null;

  const { companyNo, name } = company;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("companyNo", companyNo);
      formData.append("description", form.description);
      formData.append("address", form.address);
      formData.append("websiteUrl", form.websiteUrl);
      formData.append("size", form.size);

      const file = (document.getElementById("logo-upload") as HTMLInputElement)
        ?.files?.[0];

      if (file) formData.append("logoFile", file);

      const res = await companyService.updateCompany(formData);

      setPreview(res.data.logoUrl || "");
      setIsEdit(false);
      
      toast.success("Company details updated successfully!");
     } catch (error: any) {
        if (error?.status === 403 || error?.response?.status === 403) {
          toast.error("You do not have permission to edit this company.");
        } else if (error?.status === 401 || error?.response?.status === 401) {
          toast.error("Your session has expired. Please sign in again.");
        } else {
          toast.error(
            error?.message ||
            error?.response?.data?.message ||
            "Failed to update company."
          );
        }
      }
    finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEdit(false);
    setPreview(company.logoUrl || "");
    setForm({
      description: company.description || "",
      address: company.address || "",
      websiteUrl: company.websiteUrl || "",
      size: String(company.size) || "",
    });
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl border shadow-sm overflow-hidden">

      <Image
        src={"/imgs/page/company/img.png"}
        alt="Job Detail Thumbnail"
        width={1326}
        height={350}
        className="w-full h-auto object-cover"
        priority
      />

      {/* TOP INFO */}
      <div className="px-6 pt-10 pb-4 relative">
        {/* Logo */}
        <div className="absolute -top-10 left-4">
          <div className="w-25 h-25 bg-white border bỏ rounded-xl shadow flex items-center justify-center shadow-md overflow-hidden">
            <Image
              src={preview || "/imgs/company/default-logo.png"}
              alt="logo"
              width={80}
              height={80}
              className="object-contain p-2"
            />
          </div>

          {canEdit && isEdit && (
            <label className="text-xs text-blue-600 cursor-pointer mt-1 block">
              <Upload size={12} className="inline mr-1" />
              Change
              <input
                id="logo-upload"
                type="file"
                hidden
                accept="image/*"
                onChange={handleLogoChange}
              />
            </label>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex justify-end gap-2 mt-2">
            {!isEdit ? (
              <button
                onClick={() => setIsEdit(true)}
                className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm flex items-center gap-1"
              >
                <Pencil size={14} /> Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-full bg-green-600 text-white text-sm flex items-center gap-1"
                >
                  <Save size={14} />
                  {loading ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={handleCancel}
                  className="px-4 py-1.5 rounded-full bg-gray-100 text-sm flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* Name */}
        <div className="mt-8">
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="text-gray-500 text-sm">Company page</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 py-4 grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-4">

          {/* ABOUT */}
          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">About</p>

            {isEdit ? (
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-md p-2 text-sm"
                rows={5}
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {form.description}
              </p>
            )}
          </div>

          {/* INFO GRID */}
          <div className="grid sm:grid-cols-2 gap-4">

            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={14} /> Address
              </p>

              {isEdit ? (
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-md p-2 text-sm"
                />
              ) : (
                <p className="text-sm">{form.address}</p>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 size={14} /> Size
              </p>

              {isEdit ? (
                <input
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-md p-2 text-sm"
                />
              ) : (
                <p className="text-sm">{form.size}</p>
              )}
            </div>

            <div className="border rounded-lg p-4 sm:col-span-2">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Globe size={14} /> Website
              </p>

              {isEdit ? (
                <input
                  name="websiteUrl"
                  value={form.websiteUrl}
                  onChange={handleChange}
                  className="w-full mt-1 border rounded-md p-2 text-sm"
                />
              ) : (
                <Link
                  href={form.websiteUrl || "#"}
                  className="text-blue-600 text-sm"
                >
                  {form.websiteUrl}
                </Link>
              )}
            </div>

          </div>

          <Image
            src={"/imgs/page/homepage5/bg-banner.png"}
            alt="decoration"
            width={256}
            height={256}
            className="object-contain"
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="border rounded-lg p-4 h-fit">
          <p className="text-sm font-medium mb-3">Company details</p>

          <div className="text-xs text-gray-500 space-y-2">
            <p>Industry • Technology</p>
            <p>Headquarters • {form.address || "—"}</p>
            <p>Company size • {form.size || "—"}</p>
            <p>Website • {form.websiteUrl || "—"}</p>
          </div>

          <Image
            src={"/imgs/page/company/bg-hiring-right.svg"}
            alt="decoration"
            width={256}
            height={256}
            className="object-contain p-2"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;