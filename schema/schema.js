const graphql = require("graphql");
const User = require("../models/user");
const Product = require("../models/product");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

require('dotenv').config();

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    orders: {
      type: new GraphQLList(ProductType),
      resolve(parent, args) {
        return parent.orders.map((el) => Product.findById(el));
      },
    },
  }),
});

const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLID },
    description: { type: GraphQLString },
    price: { type: GraphQLInt },
    seller: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.seller);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id);
      },
    },
    Product: {
      type: ProductType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Product.findById(args.id);
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({});
      },
    },
    Products: {
      type: new GraphQLList(ProductType),
      resolve(parent, args) {
        return Product.find({});
      },
    },
    login: {
      type: GraphQLString,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const findUser = await User.findOne({ email: args.email });
        if (!findUser) return "Not found";

        return new Promise((resolve, reject) => {
          bcrypt.compare(args.password, findUser.password, (err, res) => {
            if (res) resolve(jwt.sign({...findUser._doc}, process.env.JWT_SECRET_KEY));
            else resolve("Password is Wrong");
          });
        })

      }
    }
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: GraphQLString,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const hashPassowrd = bcrypt.hashSync(args.password, bcrypt.genSaltSync(10));
        let user = new User({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: hashPassowrd,
        });
        return new Promise((resolve, reject) => {
          user.save((err, res) => {
            resolve(jwt.sign({ ...res._doc }, process.env.JWT_SECRET_KEY));
          });
        })
      },
    },
    editUser: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(parent, args) {
        let hashPassowrd = null;
        if (args.password) {
          hashPassowrd = bcrypt.hashSync(args.password, bcrypt.genSaltSync(10));
        }
        return new Promise((resolve, reject) => {
          User.findOne({ _id: args.id }, function (err, res) {
            if (err) reject(err);
            else {
              res.firstName = args.firstName;
              res.lastName = args.lastName;
              res.email = args.email;
              if (hashPassowrd) res.password = hashPassowrd;
              res.save();
              resolve(jwt.sign({ ...res._doc }, process.env.JWT_SECRET_KEY));
            }
          });
        });
      },
    },
    addProduct: {
      type: UserType,
      args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLInt },
        seller: { type: GraphQLID },
      },
      resolve(parent, args) {
        let product = new Product({
          title: args.title,
          description: args.description,
          price: args.price,
          seller: args.seller,
        });
        return product.save();
      },
    },
    buy: {
      type: UserType,
      args: {
        id: { type: GraphQLID },
        productID: { type: GraphQLID },
      },
      resolve(parent, args) {
        return new Promise((resolve, reject) => {
          User.findOne({ _id: args.id }, function (err, res) {
            if (err) reject(err);
            else {
              res.orders.push(args.productID);
              resolve(res.save());
            }
          });
        });
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
