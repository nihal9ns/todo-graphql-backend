const { UserError } = require("graphql-errors");
const ToDoModel = require("./models/ToDo");

const checkIfToDoExists = async _id => {
  const todo = await ToDoModel.findOne({ _id });
  if (!todo) {
    throw new UserError(`ToDo with id ${_id} does not exist!`);
  }

  return true;
};

module.exports = { checkIfToDoExists };
