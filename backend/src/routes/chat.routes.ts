import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getChatList } from '../controllers/chat.controller';
import { getMessages, sendMessage, deleteMessage, searchMessages } from '../controllers/message.controller';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', getChatList);
router.get('/:tripId/messages', getMessages);
router.get('/:tripId/messages/search', searchMessages);
router.post('/:tripId/messages', sendMessage);
router.delete('/messages/:messageId', deleteMessage); 

export default router;