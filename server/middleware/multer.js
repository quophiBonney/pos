import multer from "multer";

// Memory storage (so we can upload buffer directly to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
