// we need the require express file
const express = require("express");
// including express
const app = express();
// bodyParser is a middleware
const bodyParser = require("body-parser");
//
// require("dotenv").config();
// MongoClient is there
const MongoClient = require("mongodb").MongoClient;

var db, collection;
// const url = process.env.dburl;
const url = "mongodb+srv://dblist:t4HE9Ki1WpZi27Un@cluster0.ozjdf.mongodb.net/dbtodolist?retryWrites=true&w=majority";
const dbName = "dbtodolist";
// console.log(url);
// listen for the port 3000 on the server
//  "error code Error 3000" is commonly caused by incorrectly configured system settings or irregular entries in the Windows system elements
app.listen(5001, () => {
  MongoClient.connect(
    url,
    // DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient. ... js driver rewrote the tool it uses to parse MongoDB connection strings
    { useNewUrlParser: true, useUnifiedTopology: true },
    (error, client) => {
      // condition for if there's an error
      if (error) {
        throw error;
      }
      db = client.db(dbName);
      console.log("Connected to `" + dbName + "`!");
    }
  );
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// .json is returning a json file
app.use(bodyParser.json());
app.use(express.static("public"));
// this get the path of the root folder
app.get("/", (req, res) => {
  db.collection("messages")
    .find()
    // Converts the JavaScript value to an array.
    .toArray((err, result) => {
      if (err) return console.log(err);
      // The res.render() function is used to render a view and sends the rendered HTML string to the client.
      res.render("index.ejs", { messages: result });
    });
});

// The HTTP POST method sends data to the server
// Create (POST) - Make something
app.post("/messages", (req, res) => {
  db.collection("messages").insertOne(
    { name: req.body.name },
    (err, result) => {
      if (err) return console.log(err);
      console.log("saved to database");
      res.redirect("/");
    }
  );
});
// Update (PUT) - Change something
app.put("/messages", (req, res) => {
  db.collection("messages").findOneAndUpdate(
    {
      name: req.body.name,
      msg: req.body.msg,
    },
    {
      $set: {
        thumbUp: req.body.thumbUp + 1,
      },
    },
    {
      sort: { _id: -1 },
      // check if the property exist ad create it
      upsert: true,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

// Update (PUT) - Change something
app.put("/test", (req, res) => {
  db.collection("messages").findOneAndUpdate(
    {
      name: req.body.name,
      msg: req.body.msg,
    },
    // {
    //   $set: {
    //     // this is for thumbdown
    //     thumbUp: req.body.thumbUp - 1,
    //   },
    // },
    {
      sort: {
        _id: -1
       },
      upsert: true,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

// Delete (DELETE)- Remove something
app.delete("/messages", (req, res) => {
  // We need to create a collection before we can store items into a database. Here’s a simple analogy to help you clear up the terms in MongoDB:
  // findOneAndDelete () Remove a single document from a collection based on a query filter and return a document with the same form as the document immediately before it was deleted
  db.collection("messages").findOneAndDelete(
    { name: req.body.name},
    (err, result) => {
// The 500 Internal Server Error is a very general HTTP status code that means something has gone wrong on the web site's server but the server could not be more specific on what the exact problem is.
      if (err) return res.send(500, err);
      res.send("Message deleted!");
    }
  );
});
