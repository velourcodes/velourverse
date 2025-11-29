import multer from "multer";

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        const uniquename = Date.now() + "-" + file.originalname;
        cb(null, file.uniquename);
    },
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
});

export const upload = multer({ storage });
