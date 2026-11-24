import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../utils/db.js";

const router = express.Router();

function parseUserId(rawId) {
  const num = Number(rawId);
  return Number.isNaN(num) ? rawId : num;
}

// GET /api/watchlist/:userId -> Rol fark etmeksizin kimliği doğrulanmış kullanıcıya 200 döner
router.get("/:userId", authenticate, (req, res) => {
  const userId = parseUserId(req.params.userId);
  const watchlist = getWatchlist(userId);

  if (watchlist === null) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.status(200).json(watchlist);
});

// POST /api/watchlist/:userId/movies -> 201 ile film ekler
router.post(
  "/:userId/movies",
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = parseUserId(req.params.userId);
    const createdMovie = addMovie(userId, req.body);

    if (!createdMovie) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(201).json(createdMovie);
  }
);

// PUT /api/watchlist/:userId/movies/:movieId -> 200 ile filmi günceller
router.put(
  "/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = parseUserId(req.params.userId);
    const movieId = Number(req.params.movieId);
    const updatedMovie = updateMovie(userId, movieId, req.body);

    if (!updatedMovie) {
      return res.status(404).json({ error: "Movie or user not found." });
    }

    return res.status(200).json(updatedMovie);
  }
);

// DELETE /api/watchlist/:userId/movies/:movieId -> 200 ile filmi siler
router.delete(
  "/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  (req, res) => {
    const userId = parseUserId(req.params.userId);
    const movieId = Number(req.params.movieId);
    const deleted = deleteMovie(userId, movieId);

    if (!deleted) {
      return res.status(404).json({ error: "Movie or user not found." });
    }

    return res.status(200).json({ message: "Movie removed." });
  }
);

export default router;