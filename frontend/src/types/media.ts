export interface MediaItem {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_type: 'image' | 'video' | 'pdf' | 'document';
  mime_type: string;
  file_size: number;
  uploaded_by_id: number;
  uploaded_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface MediaFilterParams {
  search?: string;
  file_type?: string;
  sort_by?: 'created_at' | 'name' | 'size';
  sort_order?: 'asc' | 'desc';
}
