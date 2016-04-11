var request = require('request').defaults({ //request allows you to make request to other services
    json: true
});

var async = require('async');

module.exports = function(app){

    // Read
    app.get('/pets', function(req, res){

        async.parallel({

        dog: function(callback){
            request({uri: 'http://localhost:3001/dog'}, function(error, response, body){
                if(error){
                    callback({service: 'dog', error:error});
                    return;
                }
                if(!error && response.statusCode === 200){
                    callback(null, body.data);
                } else{
                    callback(response.statusCode);
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