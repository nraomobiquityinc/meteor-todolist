TasksCollection = new Mongo.Collection("tasks");

if (Meteor.isClient) {
    Template.body.helpers({
        tasks: function(){
            return TasksCollection.find({}, {sort: {createdAt: -1}});
        }
    });

    Template.body.events({
        "submit .newTask": function(e){
            var text = e.target.text.value;

            TasksCollection.insert({
                text: text,
                createdAt: new Date()
            });

            e.target.text.value = "";

            return false; //prevent default form submit
        }
    });

    Template.body.events({
        "click .toggle-checked": function(){
            TasksCollection.update(this._id, {$set: {checked: !this.checked}});
        },

        "click .delete": function(){
            TasksCollection.remove(this._id);
        }
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
