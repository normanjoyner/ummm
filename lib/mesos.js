var request = require("request");
var ip = require("ip");

module.exports = {

    init: function(options){
        this.url = [options.host, options.port].join(":");
        this.restrict_to_leader = options.restrict_to_leader;
    },

    is_leader: function(fn){
        var self = this;

        var options = {
            url: ["http:/", this.url, "master", "state.json"].join("/"),
            method: "GET",
            json: true
        }

        request(options, function(err, response){
            if(err || response.statusCode != 200)
                return fn(false);
            else if(self.restrict_to_leader){
                if(response.body.leader.indexOf(ip.address()) >= 0)
                    return fn(true);
                else
                    return fn(false);
            }
            else{
                self.url = response.body.leader;
                fn(true)
            }
        });
    },

    get_metrics: function(fn){
        var options = {
            url: ["http:/", this.url, "master", "stats.json"].join("/"),
            method: "GET",
            json: true
        }

        request(options, fn);
    }

}
