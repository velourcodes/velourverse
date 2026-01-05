import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";
const playlistRouter = Router();

playlistRouter.route("/create-playlist").post(JWTVerify, createPlaylist);
playlistRouter
    .route("/get-user-playlists/:userId")
    .get(JWTVerify, getUserPlaylists);
playlistRouter
    .route("/get-playlist-by-id/:playlistId")
    .get(JWTVerify, getPlaylistById);
playlistRouter
    .route("/add-video-to-playlist/:playlistId/:videoId")
    .patch(JWTVerify, addVideoToPlaylist);
playlistRouter
    .route("/remove-video-from-playlist/:playlistId/:videoId")
    .patch(JWTVerify, removeVideoFromPlaylist);
playlistRouter
    .route("/delete-playlist/:playlistId")
    .delete(JWTVerify, deletePlaylist);
playlistRouter
    .route("/update-playlist/:playlistId")
    .patch(JWTVerify, updatePlaylist);

export default playlistRouter;
