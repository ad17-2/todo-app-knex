const todoQuery = require("../database/queries/todos");
const userQuery = require("../database/queries/users");

const { NotFoundError, BadRequestError } = require("../errors/app-error");

const { uuidv7 } = require("uuidv7");

module.exports = {};

function validateTodoPayload(title, description, due_date, project_id) {
  if (!title || !description || !due_date || !project_id) {
    throw new BadRequestError(
      "Title, description, due_date, and project_id are required"
    );
  }

  if (title.length < 3) {
    throw new BadRequestError("Title must be at least 3 characters");
  }

  if (title.length > 255) {
    throw new BadRequestError("Title must be less than 255 characters");
  }

  if (description.length < 3) {
    throw new BadRequestError("Description must be at least 3 characters");
  }

  if (description.length > 255) {
    throw new BadRequestError("Description must be less than 255 characters");
  }

  const currentDate = new Date();
  const dueDate = new Date(due_date);

  if (dueDate < currentDate) {
    throw new BadRequestError("Due date must be in the future");
  }
}

async function createTodo(req, res, next) {
  try {
    const { title, description, due_date, project_id } = req.body;

    validateTodoPayload(title, description, due_date, project_id);

    const todo = {
      id: uuidv7(),
      title,
      description,
      due_date,
      project_id,
    };

    const [newTodo] = await todoQuery.createTodo(todo);

    res.json({
      status: true,
      data: newTodo,
    });
  } catch (error) {
    next(error);
  }
}

async function getTodos(req, res, next) {
  try {
    const todos = await todoQuery.getTodos();

    res.json({
      status: true,
      data: todos,
    });
  } catch (error) {
    next(error);
  }
}

async function getTodoById(req, res, next) {
  try {
    const { todoId } = req.params;

    const [todo] = await todoQuery.getTodoById(todoId);

    if (!todo) {
      throw new NotFoundError("Todo not found");
    }

    res.json({
      status: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
}

async function updateTodoById(req, res, next) {
  try {
    const { todoId } = req.params;
    const { title, description, due_date, project_id } = req.body;

    validateTodoPayload(title, description, due_date, project_id);

    const todo = {
      title,
      description,
      due_date,
      project_id,
    };

    const [updatedTodo] = await todoQuery.updateTodo(todoId, todo);

    if (!updatedTodo) {
      throw new NotFoundError("Todo not found");
    }

    res.json({
      status: true,
      data: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTodoById(req, res, next) {
  try {
    const { todoId } = req.params;

    const deletedTodoCount = await todoQuery.deleteTodoById(todoId);

    if (deletedTodoCount === 0) {
      throw new NotFoundError("Todo not found");
    }

    res.json({
      status: true,
    });
  } catch (error) {
    next(error);
  }
}

async function getTodoComments(req, res, next) {
  try {
    const { todoId } = req.params;

    const comments = await todoQuery.getTodoComments(todoId);

    res.json({
      status: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
}

async function updateTodoStatus(req, res, next) {
  try {
    const { todoId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new BadRequestError("Status is required");
    }

    if (status !== "pending" && status !== "in_progress" && status !== "done") {
      throw new BadRequestError("Invalid status");
    }

    const todo = {
      status,
    };

    const [updatedTodo] = await todoQuery.updateTodo(todoId, todo);

    if (!updatedTodo) {
      throw new NotFoundError("Todo not found");
    }

    res.json({
      status: true,
      data: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
}

async function updateTodoAssignee(req, res, next) {
  try {
    const { todoId } = req.params;
    const { assignedUserId } = req.body;

    if (!assignedUserId) {
      throw new BadRequestError("assigned_user_id is required");
    }

    const user = await userQuery.getUserById(assignedUserId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const todo = {
      assigned_user_id: assignedUserId,
    };

    const [updatedTodo] = await todoQuery.updateTodo(todoId, todo);

    if (!updatedTodo) {
      throw new NotFoundError("Todo not found");
    }

    res.json({
      status: true,
      data: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodoById,
  deleteTodoById,
  getTodoComments,
  updateTodoStatus,
  updateTodoAssignee,
};
