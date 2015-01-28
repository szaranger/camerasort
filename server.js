var mongodb = require('mongodb');
var db;
var items = new Array();
 
db = new mongodb.Db('camerasort', new mongodb.Server('paulo.mongohq.com', 10018, {auto_reconnect:true}), {});
 
db.open(function(err, p_client) {

  db.authenticate('username', 'password', function(err) {
   //Change error handler when going into production 
   if (err) console.log(err);
    
    var collection = new mongodb.Collection(db, 'cameras');
    collection.find({}).toArray(function(err, docs) {
      //In an array, this will log all your documents you added before we tested this
      //console.dir(docs);
      items = docs;
    });
  });
});

var express = require('express'),
  http = require('http');

var app = express()
  .use(express.bodyParser())
  .use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index.hbs', {data: JSON.stringify(items)});
});

app.get('/items', function  (req, res) {
  res.json(items);
});

app.post('/items', function  (req, res) {
  var matches = items.filter(function  (item) {
    return item.url === req.body.url;
  });

  if (matches.length > 0) {
    res.json(409, {status: 'item already exists'});
  } else {
    req.body.id = req.body.url;
    items.push(req.body);
    res.json(req.body);
  }

});

app.get('/items/:item_name', function  (req, res) {
  var matches = items.filter(function  (item) {
    return item.url === req.params.item_name;
  });

  if (matches.length > 0) {
    res.json(matches[0]);
  } else {
    res.json(404, {status: 'invalid menu item'});
  }

});

app.delete('/items/:item_name', function  (req, res) {

  var found = false;

  items.forEach(function (item, index) {
    if (item.url === req.params.item_name) {
      found = index;
    }
  });

  if (found) {
    items.splice(found, 1);
    res.json(200, {status: 'deleted'});
  } else {
    res.json(404, {status: 'invalid menu item'});
  }

});

app.get('/*', function  (req, res) {
  res.json(404, {status: 'not found'});
});

http.createServer(app).listen(3000, function () {
  console.log("Server ready at http://localhost:3000");
});
