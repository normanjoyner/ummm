var util = require("util");
var _ = require("lodash");
var AWS_SDK = require("aws-sdk");
var Persistence = require([__dirname, "..", "lib", "persistence"].join("/"));
var async = require("async");

function Cloudwatch(config){
    this.initialize("cloudwatch");
    AWS_SDK.config.update(config);
    this.cloudwatch = new AWS_SDK.CloudWatch();
}

util.inherits(Cloudwatch, Persistence);

Cloudwatch.prototype.send_metrics = function(options, metrics, fn){
    var self = this;

    var metrics = _.map(metrics, function(value, name){
        return {
            name: name,
            value: value
        }
    });

    var error;
    var collections = [];
    var max_size = 20;
    var timestamp = new Date();

    while(metrics.length > 0)
        collections.push(metrics.splice(0, max_size));

    async.each(collections, function(collection, cb){
        var data = {
            MetricData: [],
            Namespace: options.prefix
        }

        data.MetricData = _.map(collection, function(metric){
            return {
                MetricName: metric.name,
                Dimensions: [
                    {
                      Name: options.dimension_name,
                      Value: options.dimension_value
                    }
                ],
                Timestamp: timestamp,
                Unit: "Count",
                Value: metric.value
            }
        });

        self.cloudwatch.putMetricData(data, function(err, data){
            if(err)
                error = true;

            return cb();
        });
    }, function(){
        return fn(error);
    });
}

module.exports = Cloudwatch;
