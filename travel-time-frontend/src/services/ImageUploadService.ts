const CLOUD_NAME = 'value';
const UPLOAD_PRESET = 'value'; 

class ImageUploadService {
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Помилка завантаження зображення');
            }

            const data = await response.json();
            return data.secure_url; // Повертаємо URL
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
}

export const imageUploadService = new ImageUploadService();
