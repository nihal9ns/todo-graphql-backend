const mongoose = require("mongoose");
const ToDoModel = require("../models/ToDo");
const { checkIfToDoExists } = require("../validations");
const { todos } = require("./mocks");

describe("TEST validations", () => {
  beforeAll(async () => {
    const url = "mongodb://localhost/test-todo-app";

    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await ToDoModel.insertMany(todos);
  });

  afterAll(async () => {
    await ToDoModel.deleteMany({});
    await mongoose.connection.close();
  });

  it("Should return true if todo exist", async () => {
    const todo = await ToDoModel.find({});
    const foundToDo = await checkIfToDoExists(todo[0]._id);
    expect(foundToDo).toBeDefined();
    expect(foundToDo).toBeTruthy();
  });

  it("Should throw error if todo does not exist", async () => {
    try {
      const id = "5d99919960dd0d698dbe228c"; // does not exist
      await checkIfToDoExists(id);
    } catch (err) {
      expect(err).toMatchSnapshot();
    }
  });
});
