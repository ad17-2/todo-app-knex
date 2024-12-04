const knex = require("../connection");

function createComment(comment) {
  return knex("comments").insert(comment).returning("*");
}

function getComments() {
  return knex("comments").select(["id", "content", "created_at"]);
}

function getCommentById(commentId) {
  return knex("comments")
    .where({ id: commentId })
    .select(["id", "content", "created_at"]);
}

function updateComment(id, comment) {
  return knex("comments").update(comment).where({ id: id }).returning("*");
}

function deleteCommentById(commentId) {
  return knex("comments").where({ id: commentId }).del();
}

module.exports = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteCommentById,
};
