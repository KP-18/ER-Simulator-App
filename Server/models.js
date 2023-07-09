const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const attributeSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4
    },
    name: {
        type: String,
    },
    dataType: {
        type: String,
    },
    isPrimaryKey: {
        type: Boolean,
    },
    isMultivalue: {
        type: Boolean,
    }
});

const entitySchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4
    },
    name: {
        type: String,
        required: true
    },
    attributes: [attributeSchema]
});

const Attribute = mongoose.model("Attribute", attributeSchema);
const Entity = mongoose.model("Entity", entitySchema);

// Relationship model
const RelationshipSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4
    },
    name: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
    },
    // type should be one of the following: one-to-one, one-to-many, many-to-one, many-to-many

    type: {
      type: String,
      required: true,
    },
    attributes: {
      type: [attributeSchema],
      required: false,
    },
  });

const Relationship = mongoose.model("Relationship", RelationshipSchema);

// ER Diagram model

const erDiagramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default : "Untitled ERD",
    min: 3,
    max: 50,
  },
  entities: [entitySchema],
  relationships: [RelationshipSchema],
});


const ErDiagram = mongoose.model('ErDiagram', erDiagramSchema);

module.exports = { Attribute, Entity, ErDiagram, Relationship };