const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`LLD Practice Platform Backend running on http://localhost:${PORT}`);
});
