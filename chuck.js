/*
Red Hat MAP MBaaS service demo
retrieves random joke from api.chucknorris.io, having checked local platform cache first
*/
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');

function chuckRoute() {
  var chuck = new express.Router();
  chuck.use(cors());
  chuck.use(bodyParser());
  // GET endpoint to get jokes categories
  chuck.get('/categories', function(req, res) {
    request('https://api.chucknorris.io/jokes/categories',
      function (error, response, body) {
         var obj = JSON.parse(body);
         var arr=Array();
	     for(var i in obj)
           {
		   var resobj={key:obj[i], value:obj[i]};
		   arr.push(resobj);
	       }
         res.json(arr); 
      });
  });
  // GET REST endpoint for a random Chuck Norris joke from api.chucknorris.io
  chuck.get('/', function(req, res) {
    // first see if it's in cache, if not retrieve from source
    var mbaasApi = require('fh-mbaas-api');
    var options = {"act": "load", "key": "randomjoke"};
    mbaasApi.cache(options, function (err, res2) {
      if (res2==null) // not in cache, retrieve from source and insert into cache
      {
      request('https://api.chucknorris.io/jokes/random'+(req.query && req.query.category ? '?category='+req.query.category : ''),
        function (error, response, body) {
          var obj = JSON.parse(body); 
          var options = {
            "act": "save",
            "key": "randomjoke",
            "value": obj.value, // the joke
            "expire": 2 // Expiry time in seconds. Optional
          };
          mbaasApi.cache(options, function (err, res3) {
            if (err) return console.error(err.toString());
            res.send(obj.value);
          });
        });
      }
      else // found in cache: return it
      {
      res.send(res2.toString());
      }
    });


    // see http://expressjs.com/4x/api.html#res.json
    //res.json({msg: 'Hello ' + world});
  });
  return chuck;
}

module.exports = chuckRoute;
