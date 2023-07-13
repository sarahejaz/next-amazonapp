import { createRouter } from 'next-connect';

import db from '../../../utils/db';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../utils/auth';

// Default Req and Res are IncomingMessage and ServerResponse
// You may want to pass in NextApiRequest and NextApiResponse
const router = createRouter();

router
  .use(async (req, res, next) => {
    const start = Date.now();
    await next(); // call next in chain
    // const end = Date.now();
    // console.log(`Request took ${end - start}ms`);
  })
  .post(async (req, res) => {
    await db.connect();
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
      isAdmin: false,
    });
    const user = await newUser.save();
    await db.disconnect();
    const token = signToken(user);
    res.send({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
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
