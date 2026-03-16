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
const cors_origin = process.env.CORS_ORIGIN ?? "http://localhost:5500";

app.use(express.json());
app.use(cors({
  origin: [cors_origin, 'null'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key']
}));

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