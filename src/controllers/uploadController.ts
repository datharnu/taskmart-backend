import { Request, Response } from 'express';
import { uploadToR2 } from '../lib/r2';
import { ValidationError } from '../errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Upload controller for handling file uploads to Cloudflare R2
 * 
 * This endpoint receives files from the frontend and streams them to R2.
 * Returns the public R2 CDN URL that can be used throughout the app.
 */

export class UploadController {
  /**
   * Upload a single file to R2
   * Expects multipart/form-data with a 'file' field
   */
  static async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      // Check if file exists in request
      if (!req.file) {
        throw new ValidationError('No file provided. Please upload a file.');
      }

      const file = req.file;

      // Validate file size (e.g., max 10MB for images, 50MB for videos)
      const maxSize = file.mimetype.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new ValidationError(
          `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
        );
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${uuidv4()}${fileExtension}`;

      // Determine folder based on file type
      const folder = file.mimetype.startsWith('video/') ? 'videos' : 
                    file.mimetype.startsWith('image/') ? 'images' : 'files';

      // Upload to R2
      const publicUrl = await uploadToR2(
        file.buffer,
        uniqueFileName,
        file.mimetype,
        folder
      );

      // Return the public URL
      res.status(200).json({
        success: true,
        url: publicUrl,
        fileName: uniqueFileName,
        fileSize: file.size,
        mimeType: file.mimetype,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files to R2
   * Expects multipart/form-data with 'files' field (array)
   * Uploads files individually - if one fails, others can still succeed
   */
  static async uploadFiles(req: Request, res: Response): Promise<void> {
    try {
      // Check if files exist in request
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new ValidationError('No files provided. Please upload at least one file.');
      }

      const files = req.files as Express.Multer.File[];
      const uploadResults = [];
      const errors: string[] = [];

      console.log(`Processing batch upload of ${files.length} file(s)...`);

      // Upload each file individually (allows partial success)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Validate file size
          const maxSize = file.mimetype.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
          if (file.size > maxSize) {
            throw new ValidationError(
              `File "${file.originalname}" exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`
            );
          }

          // Generate unique filename
          const fileExtension = path.extname(file.originalname);
          const uniqueFileName = `${uuidv4()}${fileExtension}`;

          // Determine folder based on file type
          const folder = file.mimetype.startsWith('video/') ? 'videos' : 
                        file.mimetype.startsWith('image/') ? 'images' : 'files';

          console.log(`Uploading file ${i + 1}/${files.length}: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

          // Upload to R2
          const publicUrl = await uploadToR2(
            file.buffer,
            uniqueFileName,
            file.mimetype,
            folder
          );

          uploadResults.push({
            url: publicUrl,
            fileName: uniqueFileName,
            originalName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
          });

          console.log(`✓ Successfully uploaded: ${file.originalname}`);
        } catch (fileError: any) {
          console.error(`✗ Failed to upload file ${i + 1} (${file.originalname}):`, fileError.message);
          errors.push(`${file.originalname}: ${fileError.message || 'Upload failed'}`);
        }
      }

      // If all files failed, throw error
      if (uploadResults.length === 0) {
        throw new ValidationError(
          `All files failed to upload. Errors: ${errors.join('; ')}`
        );
      }

      // If some files failed, return partial success with warning
      if (errors.length > 0) {
        console.warn(`⚠ Partial upload success: ${uploadResults.length}/${files.length} files uploaded`);
        console.warn(`Failed files: ${errors.join(', ')}`);
      }

      // Return the public URLs (even if some failed)
      res.status(200).json({
        success: true,
        files: uploadResults,
        count: uploadResults.length,
        ...(errors.length > 0 && {
          warnings: errors,
          message: `${uploadResults.length} of ${files.length} files uploaded successfully`,
        }),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in batch upload:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}



