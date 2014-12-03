#!/usr/bin/env node
var _ = require("lodash");
var nomnom = require("nomnom");
var pkg = require([__dirname, "package"].join("/"));
var logger = require([__dirname, "lib", "logger"].join("/"));
var mesos = require([__dirname, "lib", "mesos"].join("/"));

nomnom.script(pkg.name);

var default_options = {
    version: {
        flag: true,
        abbr: "v",
        help: "Print version and exit",
        callback: function(){
            return pkg.version;
        }
    },

    prefix: {
        help: "Metric prefix",
        required: true
    },

    "mesos-host": {
        help: "Mesos host",
        default: "localhost"
    },

    "mesos-port": {
        help: "Mesos port",
        default: 5050
    },

    "restrict-to-leader": {
        flag: true,
        help: "Only send metrics if ummm is running on the Mesos master"
    }
}

var s3_options = _.defaults(default_options, {
    region: {
        help: "AWS Region",
        default: "us-east-1"
    },

    "access-key-id": {
        help: "AWS access key id",
        required: true
    },

    "secret-access-key": {
        help: "AWS secret access key",
        required: true
    },

    "dimension-name": {
        help: "AWS Cloudwatch dimension name",
        required: true
    },

    "dimension-value": {
        help: "AWS Cloudwatch dimension value",
        required: true
    }
});

nomnom.command("cloudwatch").options(s3_options).callback(function(options){
    var Cloudwatch = require([__dirname, "persistence", "cloudwatch"].join("/"));
    var cloudwatch = new Cloudwatch({
        region: options.region,
        credentials: {
            accessKeyId: options["access-key-id"],
            secretAccessKey: options["secret-access-key"]
        }
    });

    mesos.init({
        host: options["mesos-host"],
        port: options["mesos-port"],
        restrict_to_leader: options["restrict-to-leader"]
    });

    mesos.is_leader(function(leader){
        if(leader){
            mesos.get_metrics(function(err, response){
                if(err)
                    logger.log("error", err.message);
                else if(response.statusCode != 200)
                    logger.log("error", "Invalid response from Mesos leader");
                else{
                    cloudwatch.send_metrics({
                        prefix: options.prefix,
                        dimension_name: options["dimension-name"],
                        dimension_value: options["dimension-value"]
                    }, response.body, function(err){
                        if(err)
                            logger.log("error", "Failed to ship metrics to Cloudwatch!");
                        else
                            logger.log("info", "Successfully shipped metrics to Cloudwatch!");
                    });
                }
            });
        }
        else
            logger.log("warn", "Not the leader - not sending metrics");
    });
});

nomnom.parse();
