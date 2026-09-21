import { Router } from 'express';
import * as movies from '../controllers/moviesController.js';

const router = Router();

router.get('/discover', movies.discover);
router.get('/search', movies.search);
router.get('/trending', movies.trending);
router.get('/genres', movies.genres);
router.get('/:id/similar', movies.similar);
router.get('/:id', movies.details);

export default router;
