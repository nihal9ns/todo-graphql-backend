const mongoose = require("mongoose");
const { Schema } = mongoose;

const modelName = "ToDo";

const ToDoSchema = new Schema(
  {
    userId: { type: String },
    title: { type: String },
    completed: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

const ToDo = mongoose.model(modelName, ToDoSchema);

module.exports = ToDo;
