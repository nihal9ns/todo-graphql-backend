const express = require("express");
const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const GraphqlHTTP = require("express-graphql");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const schema = require("./schema");
// const { getConfig } = require("./config");

const PORT = process.env.PORT;

// const config = getConfig();
// console.log("config : ", config);

// const { port, redisUrl, mongoUrl } = JSON.parse(config);
// console.log("port : ", port);
// console.log("redisUrl : ", redisUrl);
// console.log("mongoUrl : ", mongoUrl);

const client = redis.createClient({ url: process.env.REDIS_URL });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(
  session({
    secret: "this-is-some-random-secret",
    store: new RedisStore({
      // host: "todo-redis",
      // port: 6379,
      client: client,
      ttl: 260
    }),
    saveUninitialized: false,
    resave: false
  })
);

// MongoDB Connection
mongoose
  // .connect("mongodb://todo-mongo:27017/todo-app", {
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.info("MongoDB Connected!!!"))
  .catch(err => console.error(err));

app.use(
  "/graphql",
  GraphqlHTTP({
    schema,
    // graphiql: true,
    pretty: true
  })
);

app.get("/", (req, res) => {
  res.send("TODO APP IS LIVE!!!");
});

app.post("/login", function(req, res) {
  // when user login set the key to redis.
  req.session.key = req.body.email;
  res.status(200).json({ session: req.session });
});

app.get("/logout", function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({ session: false });
    }
  });
});

const server = app.listen(PORT, () => {
  console.info(`App is now running on ${PORT} !!!`);
});

module.exports = { app, server };

// TODO: add redis based session management using express-session
// TODO: handle session using GraphQL
