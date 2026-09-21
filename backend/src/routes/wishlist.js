import { Router } from 'express';
import * as wishlist from '../controllers/wishlistController.js';

const router = Router();

router.get('/', wishlist.list);
router.get('/top-genre', wishlist.topGenre);
router.post('/', wishlist.add);
router.delete('/:id', wishlist.remove);

export default router;