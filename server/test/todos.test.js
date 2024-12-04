const todoHandler = require("../handler/todos");
const todoQuery = require("../database/queries/todos");
const userQuery = require("../database/queries/users");
const { BadRequestError, NotFoundError } = require("../errors/app-error");

// Mock the uuidv7 function
jest.mock("uuidv7", () => ({
  uuidv7: () => "mocked-uuid",
}));

// Mock the database queries
jest.mock("../database/queries/todos");
jest.mock("../database/queries/users");

describe("Todo Handler", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request, response, and next function
    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("createTodo", () => {
    it("should create a todo successfully", async () => {
      // Arrange
      const mockTodo = {
        id: "mocked-uuid",
        title: "Test Todo",
        description: "Test Description",
        due_date: "2024-12-31",
        project_id: 1,
      };

      mockReq.body = {
        title: "Test Todo",
        description: "Test Description",
        due_date: "2024-12-31",
        project_id: 1,
      };

      todoQuery.createTodo.mockResolvedValue([mockTodo]);

      // Act
      await todoHandler.createTodo(mockReq, mockRes, mockNext);

      // Assert
      expect(todoQuery.createTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mocked-uuid",
          title: "Test Todo",
          description: "Test Description",
          due_date: "2024-12-31",
          project_id: 1,
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data: mockTodo,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if required fields are missing", async () => {
      // Arrange
      mockReq.body = { title: "Test Todo" };

      // Act
      await todoHandler.createTodo(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe(
        "Title, description, due_date, and project_id are required"
      );
      expect(todoQuery.createTodo).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if title is too short", async () => {
      // Arrange
      mockReq.body = {
        title: "Te",
        description: "Test Description",
        due_date: "2024-12-31",
        project_id: 1,
      };

      // Act
      await todoHandler.createTodo(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe(
        "Title must be at least 3 characters"
      );
      expect(todoQuery.createTodo).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if due date is in the past", async () => {
      // Arrange
      mockReq.body = {
        title: "Test Todo",
        description: "Test Description",
        due_date: "2020-12-31",
        project_id: 1,
      };

      // Act
      await todoHandler.createTodo(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe(
        "Due date must be in the future"
      );
      expect(todoQuery.createTodo).not.toHaveBeenCalled();
    });
  });

  describe("getTodoById", () => {
    it("should return todo by ID successfully", async () => {
      // Arrange
      const mockTodo = {
        id: "mocked-uuid",
        title: "Test Todo",
        description: "Test Description",
        due_date: "2024-12-31",
        project_id: 1,
      };

      mockReq.params = { todoId: "mocked-uuid" };
      todoQuery.getTodoById.mockResolvedValue([mockTodo]);

      // Act
      await todoHandler.getTodoById(mockReq, mockRes, mockNext);

      // Assert
      expect(todoQuery.getTodoById).toHaveBeenCalledWith("mocked-uuid");
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data: mockTodo,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if todo doesn't exist", async () => {
      // Arrange
      mockReq.params = { todoId: "non-existent-id" };
      todoQuery.getTodoById.mockResolvedValue([]);

      // Act
      await todoHandler.getTodoById(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("Todo not found");
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("updateTodoStatus", () => {
    it("should update todo status successfully", async () => {
      // Arrange
      const mockTodo = {
        id: "mocked-uuid",
        status: "in_progress",
      };

      mockReq.params = { todoId: "mocked-uuid" };
      mockReq.body = { status: "in_progress" };

      todoQuery.updateTodo.mockResolvedValue([mockTodo]);

      // Act
      await todoHandler.updateTodoStatus(mockReq, mockRes, mockNext);

      // Assert
      expect(todoQuery.updateTodo).toHaveBeenCalledWith("mocked-uuid", {
        status: "in_progress",
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data: mockTodo,
      });
    });

    it("should throw BadRequestError if status is invalid", async () => {
      // Arrange
      mockReq.params = { todoId: "mocked-uuid" };
      mockReq.body = { status: "invalid_status" };

      // Act
      await todoHandler.updateTodoStatus(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe("Invalid status");
      expect(todoQuery.updateTodo).not.toHaveBeenCalled();
    });
  });

  describe("updateTodoAssignee", () => {
    it("should update todo assignee successfully", async () => {
      // Arrange
      const mockTodo = {
        id: "mocked-uuid",
        assigned_user_id: "user-id",
      };

      mockReq.params = { todoId: "mocked-uuid" };
      mockReq.body = { assignedUserId: "user-id" };

      userQuery.getUserById.mockResolvedValue({ id: "user-id" });
      todoQuery.updateTodo.mockResolvedValue([mockTodo]);

      // Act
      await todoHandler.updateTodoAssignee(mockReq, mockRes, mockNext);

      // Assert
      expect(todoQuery.updateTodo).toHaveBeenCalledWith("mocked-uuid", {
        assigned_user_id: "user-id",
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data: mockTodo,
      });
    });

    it("should throw NotFoundError if user doesn't exist", async () => {
      // Arrange
      mockReq.params = { todoId: "mocked-uuid" };
      mockReq.body = { assignedUserId: "non-existent-user" };

      userQuery.getUserById.mockResolvedValue(null);

      // Act
      await todoHandler.updateTodoAssignee(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("User not found");
      expect(todoQuery.updateTodo).not.toHaveBeenCalled();
    });
  });
});
