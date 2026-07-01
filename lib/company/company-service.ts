import { ApiResponse } from "@/types/response";
import { apiClient } from "@/lib/api-client";
import { Company } from "@/types/company";

export const companyService = {
  async getCompanyById(id: string): Promise<ApiResponse<Company>> {
    const res = await apiClient.get(`/job/public/companies/${id}`) as unknown as ApiResponse<Company>;
    if (!res.status || res.status >= 400) {
      throw new Error("Failed to fetch company details");
    }
    return res;
  },

  async updateCompany(formData: FormData): Promise<ApiResponse<Company>> {
    const res = await apiClient.uploadPut<ApiResponse<Company>>(
      "/job/hr/companies",
      formData
    );

    if (!res) {
      throw new Error("Failed to update company");
    }

    return res;
  }
}