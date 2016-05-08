# k-mongoose-soft-delete-cascade

A plugin to make cascade deleting with k-mongoose-soft-delete plugins

TODO: Pending add more checks, test and documentation

## Installation

The best way to install it is using **npm**

```sh
npm install k-mongoose-soft-delete-cascade --save
```

## Loading

```js
var CascadePlugin = require('k-mongoose-soft-delete-cascade');

```

## Initialization and Usage

Basic usage (you can see how works better with [test]():

```js
mongoose.connect('mongodb://localhost/k-mongoose-soft-delete-cascade');

ResourceDependent = new mongoose.Schema({
    title: {type: String},
    dependent: { type : Schema.Types.ObjectId, ref: 'Resource', default: null }
},{timestamps:true});
ResourceDependent.plugin(softDelete);


mongoose.model('ResourceDependent', ResourceDependent);
mongoose.model('ResourceDependent1', ResourceDependent);
mongoose.model('ResourceDependent2', ResourceDependent);
mongoose.model('ResourceDependent3', ResourceDependent);


Resource = new mongoose.Schema({
    title: {type: String},
    second: {type: String, soft_delete_action: 'null'},
    third:  {type: String, soft_delete_action: 'prefix'}
},{timestamps:true});


// Cascade
var tempObjectID = mongoose.Types.ObjectId(),
    cascade = [
        {model: mongoose.model('ResourceDependent'), keys: ["dependent"]},
        {model: mongoose.model('ResourceDependent1'), keys: ["dependent"], set: null },
        {model: mongoose.model('ResourceDependent2'), keys: ["dependent"], set: function(){
            "use strict";
            return tempObjectID;
        }},
        {model: mongoose.model('ResourceDependent3'), keys: ["dependent"], callback: function (err, resourceDependent) {
            mongoose.model('ResourceDependent3').create({
                title: second
            }, function (err, doc) {
                console.log("here");
            });
        }}
    ];

Resource.plugin(softDelete)
    .plugin(CascadeDeletePlugin, {"cascade": cascade});


```


## Support

This plugin is proudly supported by [Kubide](http://kubide.es/) [hi@kubide.es](mailto:hi@kubide.es)

