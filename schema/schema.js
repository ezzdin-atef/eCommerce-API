const graphql = require("graphql");
const User = require("../models/user");
const Product = require("../models/product");
const _ = require("lodash");

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
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(parent, args) {
        let user = new User({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: args.password,
        });
        return user.save();
      },
    },
    addProduct: {
      type: UserType,
      args: {
        title: { type: GraphQLID },
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
