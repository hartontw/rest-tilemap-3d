import { Router } from 'express'
const router = Router()

import * as controller from '../controllers/blocks.controller'

router.post('/', controller.post)
router.get('/', controller.get)
router.delete('/', controller.remove)

export default router;