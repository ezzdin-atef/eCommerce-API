const path = require("path");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const app = express();

mongoose.connect(
  "mongodb+srv://ezzdin_dev:dev123456@cluster0.fyzf3.mongodb.net/ecommerce?retryWrites=true&w=majority",
  { useUnifiedTopology: true, useNewUrlParser: true }
);
mongoose.connection.once("open", () => {
  console.log("Connect to database");
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
