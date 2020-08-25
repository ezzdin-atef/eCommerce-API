const path = require("path");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
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
app.use(bodyParser.json());


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

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: req.body.title,
            images: [
              req.body.photo || "https://via.placeholder.com/300/333"
            ]
          },
          unit_amount: parseInt(req.body.price, 10) * 100,
        },
        quantity: 1,
        description: req.body.description,
      },
    ],
    mode: "payment",
    success_url: "https://ecommerce-react-123.netlify.app/success/" + req.body.id,
    cancel_url: "https://ecommerce-react-123.netlify.app",
  });
  res.json({ id: session.id });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server running on port 4000");
});
