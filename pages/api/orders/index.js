import { createRouter } from 'next-connect';

import db from '../../../utils/db';
import Order from '../../../models/Order';
import { onError } from '../../../utils/error';
import { isAuth } from '../../../utils/auth';

// Default Req and Res are IncomingMessage and ServerResponse
// You may want to pass in NextApiRequest and NextApiResponse
const router = createRouter();

router
  .use(async (req, res, next) => {
    isAuth(req, res, next);
  })
  .post(async (req, res) => {
    await db.connect();
    const newOrder = new Order({
      ...req.body,
      user: req.user._id,
    });
    const order = await newOrder.save();
    res.status(201).send(order);
  });

// create a handler from router with custom
// onError and onNoMatch
export default router.handler({
  onError: (err, req, res, next) => {
    onError(err, req, res, next);
  },
  onNoMatch: (req, res) => {
    res.status(404).end('Page is not found');
  },
});
