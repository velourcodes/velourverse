import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN, // e.g. "http://localhost:4500"
        credentials: true,
    })
); // allows cookies/ auth tokens to be sent

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser);

app.listen(process.env.PORT || 5000, () => {
    console.log(`The app is running on port: ${process.env.PORT}`);
});

app.on("app_error", (app_error) => {
    console.error("App error", error);
    throw app_error;
});

export { app };
