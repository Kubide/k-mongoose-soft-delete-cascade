"use stric";

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    softDelete = require('k-mongoose-soft-delete'),
    CascadeDeletePlugin = require('../.'),
    chai = require("chai"),
    should = chai.should(),
    Resource,
    ResourceDependent;


/* Setup */
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/k-mongoose-soft-delete-cascade');




ResourceDependent = new mongoose.Schema({
    title: {type: String},
    dependent: { type : Schema.Types.ObjectId, ref: 'Resource', 'default': null }
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
        {model: mongoose.model('ResourceDependent3'), keys: ["dependent"], callback: function () {
            mongoose.model('ResourceDependent3').create({
                title: second
            });
        }}
    ];

Resource.plugin(softDelete)
    .plugin(CascadeDeletePlugin, {"cascade": cascade});

mongoose.model('Resource', Resource);


/*
 https://www.youtube.com/watch?v=--UPSacwPDA
 Am I wrong, fallin' in love with you,
 tell me am I wrong, well, fallin' in love with you
 While your other man was out there,
 cheatin' and lyin', steppin' all over you

 Uh, sweet thing
 Tell me am I wrong, holdin' on to you so tight,
 Tell me, tell me, am I wrong, holdin' on to you so tight
 If your other man come to claim you,
 he'd better be ready, ready for a long long fight
 */

/* Tests */
var title = 'Am I wrong, fallin\' in love with you!',
    second = 'tell me am I wrong, well, fallin\' in love with you',
    third = 'While your other man was out there',
    resource = {};


describe('Default plugin usage', function () {
    before(function (done) {
        //Sorry for this.
        mongoose.model('Resource').remove({}, function () {
            mongoose.model('ResourceDependent').remove({}, function () {
                mongoose.model('ResourceDependent1').remove({}, function () {
                    mongoose.model('ResourceDependent2').remove({}, function () {
                        mongoose.model('ResourceDependent3').remove({}, function () {
                            done();
                        });
                    });
                });
            });
        });
    });

/*    after(function (done) {
        mongoose.model('Resource').remove({}, function () {
            done();
        });
    });
*/
    it('Create a new resource', function (done) {
        mongoose.model('Resource').create({
            title: title,
            second : second,
            third: third
        }, function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.have.property('title').and.equal(title);
            done();
        });
    });

    it('Check the resource is in the lists', function (done) {
        mongoose.model('Resource').find({
            title: title
        }).exec(function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.be.an('array')
                .with.deep.property('[0]')
                .that.have.property("title",title);

            resource = doc[0];
            done();
        });
    });

    it('Create ResourceDependent', function (done) {
        mongoose.model('ResourceDependent').create({
            title: title,
            dependent : resource._id
        }, function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.have.property('title').and.equal(title);
            doc.should.have.property('dependent').and.equal(resource._id);
            done();
        });
    });

    it('Create ResourceDependent1', function (done) {
        mongoose.model('ResourceDependent1').create({
            title: title,
            dependent : resource._id
        }, function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.have.property('title').and.equal(title);
            doc.should.have.property('dependent').and.equal(resource._id);
            done();
        });
    });

    it('Create ResourceDependent2', function (done) {
        mongoose.model('ResourceDependent2').create({
            title: title,
            dependent : resource._id
        }, function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.have.property('title').and.equal(title);
            doc.should.have.property('dependent').and.equal(resource._id);
            done();
        });
    });

    it('Create ResourceDependent3', function (done) {
        mongoose.model('ResourceDependent3').create({
            title: title,
            dependent : resource._id
        }, function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.have.property('title').and.equal(title);
            doc.should.have.property('dependent').and.equal(resource._id);
            done();
        });
    });



    it('Softdelete the resource', function (done) {
        resource.softDelete(function(err){
            should.not.exist(err);
            resource.should.have.property('deleted').and.equal(true);
            resource.should.have.property('second').and.equal(null);
            resource.should.have.property('third').and.not.equal(third);
            done();
        });
    });


    it('Don\'t find the resource', function (done) {
        mongoose.model('Resource').find({
            title: title
        }).exec(function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.be.an('array').with.length(0);
            done();
        });
    });

    it('Don\'t find the ResourceDependent', function (done) {
        mongoose.model('ResourceDependent').find({
            title: title
        }).exec(function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.be.an('array').with.length(0);
            done();
        });
    });

    it('Find the ResourceDependent1 without dependent', function (done) {
        mongoose.model('ResourceDependent1').find({
            title: title
        }).exec(function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.be.an('array')
                .with.deep.property('[0]')
                .that.have.property("dependent",null);


            done();
        });
    });

    it('Find the ResourceDependent2 with dependent changed', function (done) {
        mongoose.model('ResourceDependent2').find({
            title: title
        }).exec(function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.be.an('array')
                .with.deep.property('[0]')
                .that.have.property("dependent");

            doc[0].dependent.equals(tempObjectID).should.be.equal(true);

            done();
        });
    });

    it('Don\'t find the ResourceDependent3 with dependent, but we find the new one', function (done) {
        mongoose.model('ResourceDependent3').find({
            title: title
        }).exec(function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.be.an('array').with.length(0);
            mongoose.model('ResourceDependent3').find({
                title: second
            }).exec(function (err, doc) {
                should.not.exist(err);
                should.exist(doc);
                doc.should.be.an('array').with.length(1);
                done();
            });

        });
    });



});
