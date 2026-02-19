import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/api-error';

export const uploadImage = async (file: Express.Multer.File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `food-delivery/${folder}`,
        transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          reject(ApiError.internal('Upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

export const uploadMultiple = async (
  files: Express.Multer.File[],
  folder: string
): Promise<string[]> => {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
};
