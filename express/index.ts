import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { userRouter } from './routes/user';

const app = express();
const port = process.env.PORT || 3000;

app.use(json());
app.use(cors());

app.use('/api/user', userRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;