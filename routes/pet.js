var request = require('request').defaults({ //request allows you to make request to other services
    json: true
});

var async = require('async');
var redis = require('redis');

var cache = redis.createClient(6379, '127.0.0.1');

module.exports = function(app){

    // Read
    app.get('/pets', function(req, res){

        async.parallel({

        dog: function(callback){
            // caching the whole resource. You can also cache the individual id.
            cache.get('http://localhost:3001/dog', function(error, dog){
                if(error){throw error;}
                if(dog){
                    callback(null, JSON.parse(dog)); // redis doesn't save as json, so we have to serialize
                } else {
                    request({uri: 'http://localhost:3001/dog'}, function (error, response, body) {
                        if (error) {
                            callback({service: 'dog', error: error});
                            // add result to cache
                            cache.set('http://localhost:3001/dog', JSON.stringify(body.data), function(error){
                                if(error){throw error;}
                            });
                        }
                        if (!error && response.statusCode === 200) {
                            callback(null, body.data);
                        } else {
                            callback(response.statusCode);
                        }
                    });
                }
            });
        },
        cat: function(callback) {
            request({uri: 'http://localhost:3000/cat'}, function (error, response, body) {
                if(error){
                    callback({service: 'cat', error:error});
                    return;
                }
                if(!error && response.statusCode === 200){
                    callback(null, body.data);
                } else{
                    callback(response.statusCode);
                }
            });
        }
    }, function(error, results){
            res.json({
                error: error,
                results: results
            });
        });
    });
};