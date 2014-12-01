TasksCollection = new Mongo.Collection("tasks");

if (Meteor.isClient) {
    Meteor.subscribe("tasks");

    Template.body.helpers({
        tasks: function(){
            if(Session.get("hideCompleted")){
                return TasksCollection.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
            }
            else{
                return TasksCollection.find({}, {sort: {createdAt: -1}});
            }
        },

        hideCompleted: function(){
            return Session.get("hideCompleted");
        },

        incompleteCount: function(){
            return TasksCollection.find({checked: {$ne: true}}).count();
        }
    });

    Template.body.events({
        "submit .newTask": function(e){
            var text = e.target.text.value;

            Meteor.call("addNewTask", text);

            e.target.text.value = "";

            return false; //prevent default form submission
        },

        "change .hideCompleted input": function(e){
            Session.set("hideCompleted", e.target.checked); //update Session when hideCompleted checkbox is clicked
        }
    });

    Template.task.helpers({
        isTaskOwner: function(){
            return this.owner === Meteor.userId();
        }
    });

    Template.task.events({
        "click .toggleChecked": function(){
            Meteor.call("toggleTaskCompletion", this);
        },

        "click .delete": function(){
            Meteor.call("deleteTask", this);
        },

        "click .togglePrivacy": function(){
            Meteor.call("toggleTaskPrivacy", this);
        }
   });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });

  Meteor.publish("tasks", function(){
      return TasksCollection.find({
          $or: [
            {isPrivate: {$ne: true}},
            {owner: this.userId}
          ]
      });
  });
}

Meteor.methods({
    addNewTask: function(text){
        if(!Meteor.userId()){
            throw new Meteor.Error("not-authorized");
        }

        TasksCollection.insert({
            text: text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            isPrivate: true, //task is private by default
            checked: false
        });
    },

    deleteTask: function(task){
        TasksCollection.remove(task._id);
    },

    toggleTaskCompletion: function(task){
        TasksCollection.update(task._id, {$set: {checked: !task.checked}});
    },

    toggleTaskPrivacy: function(task){
        if(task.owner !== Meteor.userId())
            throw new Meteor.Error("not-authorized");

        TasksCollection.update(task, {$set: {isPrivate: !task.isPrivate}});
    }
});
