const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const uploadSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "myPerson" },

  title: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Upload = mongoose.model("upload", uploadSchema);
module.exports = Upload;
