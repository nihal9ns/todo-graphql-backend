const mongoose = require("mongoose");
const request = require("supertest");
const ToDoModel = require("../models/ToDo");
const { todos } = require("./mocks");

const { app, server } = require("../server");

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

    server.close();
  });

  it("Should return all todos for userId 1", async () => {
    const query = `
    query ToDos($userId: String!){
        todos(userId: $userId){
          id
          userId
          title
          completed
        }
      }
    `;

    const body = {
      query,
      variables: { userId: "1" }
    };

    return request(app)
      .post("/graphql")
      .send(body)
      .expect(200)
      .then(res => {
        // console.log(res.body.data);
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.todos.length).toEqual(20);
      });
  });

  it("Should return a single todo", async () => {
    const query = `
    query ToDo($id: ID!){
        todo(id:$id){
          id
          userId
          title
          completed
        }
      }
    `;

    const todo = await ToDoModel.find({});

    const body = {
      query,
      variables: { id: todo[0]._id }
    };

    return request(app)
      .post("/graphql")
      .send(body)
      .expect(200)
      .then(res => {
        // console.log(res.body.data);
        // userId: '1',
        // title: 'delectus aut autem',
        // completed: false
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.todo.userId).toEqual("1");
        expect(res.body.data.todo.title).toEqual("delectus aut autem");
        expect(res.body.data.todo.completed).toBeFalsy();
      });
  });

  it("Should return blank array if no todos found for user", async () => {
    const query = `
    query ToDos($userId: String!){
        todos(userId: $userId){
          id
          userId
          title
          completed
        }
      }
    `;

    const body = {
      query,
      variables: { userId: "3" }
    };

    return request(app)
      .post("/graphql")
      .send(body)
      .expect(200)
      .then(res => {
        // console.log(res.body.data);
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.todos.length).toEqual(0);
      });
  });

  it("Should return error if no todo is found for given id", async () => {
    const query = `
    query ToDo($id: ID!){
        todo(id:$id){
          id
          userId
          title
          completed
        }
      }
    `;

    const body = {
      query,
      variables: { id: "5d99919960dd0d698dbe2285" }
    };

    return request(app)
      .post("/graphql")
      .send(body)
      .expect(200)
      .then(res => {
        // console.log(res.body.errors);
        expect(res.body.errors).toBeDefined();
        expect(res.body.data.todo).toBeNull();
      });
  });

  it("Should add todo", async () => {
    const mutation = `mutation addTodo($userId: String!, $title: String!) {
      addToDo(userId: $userId, title: $title) {
        userId
        title
        completed
      }
    }
    `;

    const body = {
      query: mutation,
      variables: {
        userId: "1",
        title: "todo 1"
      }
    };

    return request(app)
      .post("/graphql")
      .send(body)
      .expect(200)
      .then(res => {
        // console.log(res.body.data);
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.addToDo).toMatchSnapshot();
      });
  });

  it("Should add todo", async () => {
    const mutation = `mutation addTodo($userId: String!, $title: String!) {
      addToDo(userId: $userId, title: $title) {
        userId
        title
        completed
      }
    }
    `;

    const body = {
      query: mutation,
      variables: {
        userId: "1",
        title: "todo 1"
      }
    };

    return request(app)
      .post("/graphql")
      .send(body)
      .expect(200)
      .then(res => {
        // console.log(res.body.data);
        expect(res.body.errors).toBeUndefined();
        expect(res.body.data.addToDo).toMatchSnapshot();
      });
  });
});
