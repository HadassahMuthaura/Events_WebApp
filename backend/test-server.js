import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`Server address:`, server.address());
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

setInterval(() => {
  console.log('Server still alive...');
}, 5000);
