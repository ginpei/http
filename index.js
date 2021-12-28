const express = require('express');

const port = process.env.PORT || 3000;

const app = express();
app.use(express.static('.')); // working dir
app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
