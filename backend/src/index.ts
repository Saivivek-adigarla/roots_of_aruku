import app from './app.js';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(`✓ Server running on http://${HOST}:${PORT}`);
  console.log(`✓ API docs at http://${HOST}:${PORT}/api/v1`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});
