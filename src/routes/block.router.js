import { Router } from 'express'
const router = Router()

import * as controller from '../controllers/block.controller'

router.post('/', controller.post)
router.get('/', controller.get)
router.put('/', controller.put)
router.patch('/', controller.patch)
router.delete('/', controller.remove)

export default router;