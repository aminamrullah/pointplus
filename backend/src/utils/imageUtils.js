import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const processImageField = (imageInput, folder = "setting") => {
    if (!imageInput) return null;

    // Base64 handling
    if (imageInput.startsWith("data:image")) {
        // Updated regex to support more mime types (e.g. svg+xml)
        const matches = imageInput.match(/^data:image\/([\w+.-]+);base64,(.+)$/);
        if (matches) {
            const extension = matches[1] === "jpeg" ? "jpg" : matches[1].replace('+xml', '');
            const buffer = Buffer.from(matches[2], "base64");
            const fileName = `${uuidv4()}.${extension}`;
            const uploadDir = path.join(__dirname, "../../uploads", folder);

            try {
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                fs.writeFileSync(path.join(uploadDir, fileName), buffer);
                console.log(`[processImageField] Saved image: ${fileName} to ${folder}`);
                return fileName;
            } catch (error) {
                console.error(`[processImageField] Error saving image to ${folder}:`, error);
                return null;
            }
        } else {
            console.error(`[processImageField] Invalid base64 image format`);
            return null;
        }
    }

    // Existing URL handling
    if (imageInput.startsWith("http")) {
        const parts = imageInput.split("/");
        return parts[parts.length - 1]; // Return just the filename
    }

    // If it's just a filename (no path, no data: prefix)
    if (!imageInput.includes("/")) {
        return imageInput;
    }

    return null;
};
