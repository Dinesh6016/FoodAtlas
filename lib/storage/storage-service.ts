export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface StorageProvider {
  uploadImage(file: Buffer | string, filename: string): Promise<UploadResult>;
  deleteImage(publicId: string): Promise<boolean>;
}

class MockStorageProvider implements StorageProvider {
  async uploadImage(file: Buffer | string, filename: string): Promise<UploadResult> {
    // In production or when Cloudinary keys are provided, upload to CDN
    // Here we provide high-res curated CDN assets with thumbnail transformations
    const cleanName = encodeURIComponent(filename.replace(/\.[^/.]+$/, ""));
    const url = `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80&mock=${cleanName}`;
    const thumbnailUrl = `https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80&mock=${cleanName}`;
    return {
      url,
      thumbnailUrl,
      width: 1200,
      height: 800,
      format: "webp",
      bytes: 125000,
    };
  }

  async deleteImage(publicId: string): Promise<boolean> {
    return true;
  }
}

export const storageService = new MockStorageProvider();
export default storageService;
