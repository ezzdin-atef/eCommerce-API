const path = require("path");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
var { buildSchema } = require("graphql");

require('dotenv').config();


mongoose.connect(
  process.env.DB_URL,
  { useUnifiedTopology: true, useNewUrlParser: true }
);
mongoose.connection.once("open", () => {
  console.log("Connect to database");
});

app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server running on port 4000");
});
