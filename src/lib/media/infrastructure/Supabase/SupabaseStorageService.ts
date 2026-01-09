import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  IStorageService,
  StorageUploadResponse,
} from "../../domain/port/IStorageService";
import { Result } from "../../../shared/Type Helpers/result";

@Injectable()
export class SupabaseStorageService implements IStorageService {
  private readonly supabase: SupabaseClient;
  private readonly bucketName = "kahoot";

  constructor() {
    const supabaseUrl = process.env.Endpoint;
    const supabaseKey = process.env.Secretaccesskey;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase environment variables (Endpoint, Secretaccesskey) are missing."
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async upload(
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<Result<StorageUploadResponse>> {
    const uniqueFileName = `${Date.now()}-${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(uniqueFileName, file, {
        contentType: mimeType,
      });

    if (error) {
      return Result.fail(new Error(`Supabase upload failed: ${error.message}`));
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.bucketName).getPublicUrl(data.path);

    return Result.ok({ url: publicUrl, key: data.path });
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([key]);

    if (error) {
      console.error(`Supabase delete failed: ${error.message}`);
    }
  }
}
