function Persistence(){};

Persistence.prototype.initialize = function(name){
    this.name = name;
}

Persistence.prototype.send_metrics = function(fn){
    return fn();
}

module.exports = Persistence;
