const express = require("express");
const router = express.Router();
const commentHandler = require("../handler/comments");

router.post("/todos/:todoId/comments", commentHandler.createComment);
router.get("/comments", commentHandler.getComments);
router.get("/comments/:commentId", commentHandler.getCommentById);
router.put("/comments/:commentId", commentHandler.updateComment);
router.delete("/comments/:commentId", commentHandler.deleteCommentById);

module.exports = router;
