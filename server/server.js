const app = require("./server-config.js");

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;
