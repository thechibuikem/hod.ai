import 'dotenv/config';
import express     from 'express';
import cors        from 'cors';
import healthRouter from './routes/health.ts';
import flagRouter   from './routes/flag.ts';
import askRouter, { setVectorDB } from './routes/ask.ts';
import adminRouter  from './routes/admin.ts';
import { ChromaDB } from './vectordb/chroma.ts';

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'X-Admin-Key'] }));
app.use(express.json());

// Wire up the vector DB into the ask route
const db = new ChromaDB();
setVectorDB(db);

app.use('/api/v1', healthRouter);
app.use('/api/v1', flagRouter);
app.use('/api/v1', askRouter);
app.use('/api/v1', adminRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});