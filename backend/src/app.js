import express from "express";

const app = express();
app.listen(process.env.PORT, () => {
    console.log(`The app is running on port: ${process.env.PORT}`);
});
app.on("app_error", (app_error) => {
    console.error("App error", error);
    throw app_error;
});
export { app };
