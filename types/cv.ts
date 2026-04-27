export type CVTemplateType = "UPLOAD" | "GENERAL" | "TECH" | "CREATIVE";

export interface CVSections {
  skills: string[];
  projects: string[];
  education: string[];
  languages: string[];
  experience: string[];
}

export interface CVMetadata {
  cvId: string;
  objectName: string;
  headline: string | null;
  summary: string | null;
  pdfUrl: string;
  belongTo: string;
  templateType: CVTemplateType;
  sections: CVSections;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  exist: boolean;
}

export interface CVListMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface CVListResponse {
  meta: CVListMeta;
  result: CVMetadata[];
}

export interface CVUploadResponse {
  cvId: string;
  objectName: string;
  pdfUrl: string;
  templateType: string;
  createdAt: string;
}

export interface CVUpdateRequest {
  templateType?: CVTemplateType;
}
