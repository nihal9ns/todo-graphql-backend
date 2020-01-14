const graphql = require("graphql");
const { UserError } = require("graphql-errors");
const ToDoModel = require("./models/ToDo");
const { checkIfToDoExists } = require("./validations");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean
} = graphql;

const ToDoType = new GraphQLObjectType({
  name: "ToDo",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: GraphQLString },
    completed: { type: GraphQLBoolean }
  })
});

const ToDoQuery = new GraphQLObjectType({
  name: "ToDoQuery",
  fields: {
    todo: {
      type: ToDoType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => {
        const todo = await ToDoModel.findOne({ _id: args.id });
        if (!todo) {
          throw new UserError(`No todo found with id ${args.id}`);
        }

        return todo;
      }
    },
    todos: {
      type: new GraphQLList(ToDoType),
      args: { userId: { type: GraphQLString } },
      resolve: async (parent, args) => {
        return await ToDoModel.find({ userId: args.userId });
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addToDo: {
      type: ToDoType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (parent, args, request) => {
        console.log("request : ", request);
        return new ToDoModel({
          title: args.title,
          userId: args.userId
        }).save();
      }
    },
    updateToDo: {
      type: ToDoType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        completed: { type: GraphQLBoolean }
      },
      resolve: async (parent, args) => {
        // check if record exists
        await checkIfToDoExists(args.id);

        if (args.title && args.completed == undefined) {
          console.log("HERE 1");
          const result = await ToDoModel.findOneAndUpdate(
            { _id: args.id },
            { $set: { title: args.title } },
            { useFindAndModify: false, new: true }
          );

          if (!result) {
            throw new UserError(`Failed to update todo with id : ${args.id}!`);
          }

          return result;
        }

        if (args.title == undefined && args.completed != undefined) {
          console.log("HERE 2");
          const result = await ToDoModel.findOneAndUpdate(
            { _id: args.id },
            { $set: { completed: args.completed } },
            { useFindAndModify: false, new: true }
          );

          if (!result) {
            throw new UserError(`Failed to update todo with id : ${args.id}!`);
          }

          return result;
        }

        if (args.title != undefined && args.completed != undefined) {
          console.log("HERE 3");
          const result = await ToDoModel.findOneAndUpdate(
            { _id: args.id },
            { $set: { title: args.title, completed: args.completed } },
            { useFindAndModify: false, new: true }
          );

          if (!result) {
            throw new UserError(`Failed to update todo with id : ${args.id}!`);
          }

          return result;
        }
      }
    },
    removeToDo: {
      type: ToDoType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve: async (parent, args) => {
        // check if record exists
        await checkIfToDoExists(args.id);

        const result = await ToDoModel.findOneAndRemove(
          { _id: args.id },
          { useFindAndModify: false }
        );

        if (!result) {
          throw new UserError(`Failed to remove todo with id ${args.id}!`);
        }

        return result;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: ToDoQuery,
  mutation: Mutation
});
