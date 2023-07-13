import { createRouter } from 'next-connect';

import db from '../../utils/db';
import Product from '../../models/Product';
import User from '../../models/User';
import data from '../../utils/data';

// Default Req and Res are IncomingMessage and ServerResponse
// You may want to pass in NextApiRequest and NextApiResponse
const router = createRouter();

router
  .use(async (req, res, next) => {
    await next(); // call next in chain
  })
  .get(async (req, res) => {
    await db.connect();
    await User.deleteMany();
    await User.insertMany(data.users);
    await Product.deleteMany();
    await Product.insertMany(data.products);
    await db.disconnect();
    res.send({ message: 'Seeded successfully' });
  });

// create a handler from router with custom
// onError and onNoMatch
export default router.handler({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end('Something broke!');
  },
  onNoMatch: (req, res) => {
    res.status(404).end('Page is not found');
  },
});
