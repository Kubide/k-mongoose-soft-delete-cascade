'use strict';

module.exports = function(schema, options) {

    var soft_delete_cascade = function (next) {
        var that = this;
        if (this.isModified('deleted') && this.deleted != null) {
            // add pre-query logic
            options.cascade.forEach(function (element) {
                if (Array.isArray(element.keys)) {
                    element.keys.forEach(function(key){
                        let query = {};
                        query[key] = that._id;
                        element.model.find(query, function(err, cascades){
                            cascades.forEach(function (cascade) {
                                if (typeof element.set != 'undefined') {

                                    if (typeof element.set === 'function') {
                                        cascade[key] = element.set(cascade, key, element.model);
                                    }else{
                                        cascade[key] = element.set;
                                    }
                                    cascade.save(function(err, cascade){
                                        if (element.callback) {
                                            element.callback(err, cascade)
                                        }
                                    });

                                } else {
                                    cascade.softDelete(function(err, cascade){
                                        if (element.callback) {
                                            element.callback(err, cascade)
                                        }
                                    });
                                }
                            });
                        });
                    })
                }

            });
        }
        next();
    };

    if (schema.statics.SOFT_DELETE) {
        schema.pre('save', soft_delete_cascade);
    }
};