import { Router } from 'express';
import * as wishlist from '../controllers/wishlistController.js';

const router = Router();

router.get('/', wishlist.list);
router.post('/', wishlist.add);
router.delete('/:id', wishlist.remove);

export default router;
