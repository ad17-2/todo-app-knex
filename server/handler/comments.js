const todoQuery = require("../database/queries/todos");
const commentQuery = require("../database/queries/comments");
const userQuery = require("../database/queries/users");

const { NotFoundError, BadRequestError } = require("../errors/app-error");

const { uuidv7 } = require("uuidv7");

async function createComment(req, res, next) {
  try {
    const { content, todoId, userId } = req.body;

    if (!content || !todoId || !userId) {
      throw new BadRequestError("Content , todo ID, userId are required");
    }

    const existingUser = await userQuery.getUserById(userId);

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    const existingTodo = await todoQuery.getTodoById(todoId);

    if (!existingTodo) {
      throw new NotFoundError("Todo not found");
    }

    const commentObj = {
      id: uuidv7(),
      content,
      todo_id: todoId,
      user_id: userId,
    };

    const [comment] = await commentQuery.createComment(commentObj);

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
}

async function getComments(req, res, next) {
  try {
    const comments = await commentQuery.getComments();

    res.json({
      status: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
}

async function getCommentById(req, res, next) {
  try {
    const { commentId } = req.params;

    const comment = await commentQuery.getCommentById(commentId);

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    res.json({
      status: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
}

async function updateComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new BadRequestError("Content is required");
    }

    const [comment] = await commentQuery.updateComment(commentId, {
      content,
    });

    res.json({
      status: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCommentById(req, res, next) {
  try {
    const { commentId } = req.params;

    await commentQuery.deleteCommentById(commentId);

    res.json({
      status: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteCommentById,
};
