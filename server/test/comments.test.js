const commentHandler = require("../handler/comments");
const commentQuery = require("../database/queries/comments");
const todoQuery = require("../database/queries/todos");
const userQuery = require("../database/queries/users");
const { BadRequestError, NotFoundError } = require("../errors/app-error");

// Mock the uuidv7 function
jest.mock("uuidv7", () => ({
  uuidv7: () => "mocked-uuid",
}));

// Mock the database queries
jest.mock("../database/queries/comments");
jest.mock("../database/queries/todos");
jest.mock("../database/queries/users");

describe("Comment Handler", () => {
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

  describe("createComment", () => {
    it("should create a comment successfully", async () => {
      // Arrange
      const mockComment = {
        id: "mocked-uuid",
        content: "Test comment",
        todo_id: "todo-id",
        user_id: "user-id",
      };

      mockReq.body = {
        content: "Test comment",
        todoId: "todo-id",
        userId: "user-id",
      };

      userQuery.getUserById.mockResolvedValue({ id: "user-id" });
      todoQuery.getTodoById.mockResolvedValue({ id: "todo-id" });
      commentQuery.createComment.mockResolvedValue([mockComment]);

      // Act
      await commentHandler.createComment(mockReq, mockRes, mockNext);

      // Assert
      expect(userQuery.getUserById).toHaveBeenCalledWith("user-id");
      expect(todoQuery.getTodoById).toHaveBeenCalledWith("todo-id");
      expect(commentQuery.createComment).toHaveBeenCalledWith({
        id: "mocked-uuid",
        content: "Test comment",
        todo_id: "todo-id",
        user_id: "user-id",
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockComment,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if any required field is missing", async () => {
      // Test cases for each missing field
      const testCases = [
        { body: { todoId: "todo-id", userId: "user-id" } }, // missing content
        { body: { content: "Test", userId: "user-id" } }, // missing todoId
        { body: { content: "Test", todoId: "todo-id" } }, // missing userId
      ];

      for (const testCase of testCases) {
        // Arrange
        mockReq.body = testCase.body;

        // Act
        await commentHandler.createComment(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockNext.mock.calls[0][0].message).toBe(
          "Content , todo ID, userId are required"
        );
        expect(commentQuery.createComment).not.toHaveBeenCalled();

        // Reset mock for next test case
        jest.clearAllMocks();
      }
    });

    it("should throw NotFoundError if user doesn't exist", async () => {
      // Arrange
      mockReq.body = {
        content: "Test comment",
        todoId: "todo-id",
        userId: "non-existent-user",
      };

      userQuery.getUserById.mockResolvedValue(null);

      // Act
      await commentHandler.createComment(mockReq, mockRes, mockNext);

      // Assert
      expect(userQuery.getUserById).toHaveBeenCalledWith("non-existent-user");
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("User not found");
      expect(todoQuery.getTodoById).not.toHaveBeenCalled();
      expect(commentQuery.createComment).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if todo doesn't exist", async () => {
      // Arrange
      mockReq.body = {
        content: "Test comment",
        todoId: "non-existent-todo",
        userId: "user-id",
      };

      userQuery.getUserById.mockResolvedValue({ id: "user-id" });
      todoQuery.getTodoById.mockResolvedValue(null);

      // Act
      await commentHandler.createComment(mockReq, mockRes, mockNext);

      // Assert
      expect(userQuery.getUserById).toHaveBeenCalledWith("user-id");
      expect(todoQuery.getTodoById).toHaveBeenCalledWith("non-existent-todo");
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("Todo not found");
      expect(commentQuery.createComment).not.toHaveBeenCalled();
    });
  });

  describe("getComments", () => {
    it("should return all comments successfully", async () => {
      // Arrange
      const mockComments = [
        {
          id: "comment-1",
          content: "Comment 1",
          todo_id: "todo-1",
          user_id: "user-1",
        },
        {
          id: "comment-2",
          content: "Comment 2",
          todo_id: "todo-2",
          user_id: "user-2",
        },
      ];

      commentQuery.getComments.mockResolvedValue(mockComments);

      // Act
      await commentHandler.getComments(mockReq, mockRes, mockNext);

      // Assert
      expect(commentQuery.getComments).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data: mockComments,
      });
    });
  });

  describe("getCommentById", () => {
    it("should return comment by ID successfully", async () => {
      // Arrange
      const mockComment = {
        id: "mocked-uuid",
        content: "Test comment",
        todo_id: "todo-id",
        user_id: "user-id",
      };

      mockReq.params = { commentId: "mocked-uuid" };
      commentQuery.getCommentById.mockResolvedValue(mockComment);

      // Act
      await commentHandler.getCommentById(mockReq, mockRes, mockNext);

      // Assert
      expect(commentQuery.getCommentById).toHaveBeenCalledWith("mocked-uuid");
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data: mockComment,
      });
    });

    it("should throw NotFoundError if comment doesn't exist", async () => {
      // Arrange
      mockReq.params = { commentId: "non-existent-id" };
      commentQuery.getCommentById.mockResolvedValue(null);

      // Act
      await commentHandler.getCommentById(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("Comment not found");
    });
  });

  describe("updateComment", () => {
    it("should update comment successfully", async () => {
      // Arrange
      const mockUpdatedComment = {
        id: "mocked-uuid",
        content: "Updated comment",
        todo_id: "todo-id",
        user_id: "user-id",
      };

      mockReq.params = { commentId: "mocked-uuid" };
      mockReq.body = { content: "Updated comment" };

      commentQuery.updateComment.mockResolvedValue([mockUpdatedComment]);

      // Act
      await commentHandler.updateComment(mockReq, mockRes, mockNext);

      // Assert
      expect(commentQuery.updateComment).toHaveBeenCalledWith("mocked-uuid", {
        content: "Updated comment",
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data: mockUpdatedComment,
      });
    });

    it("should throw BadRequestError if content is missing", async () => {
      // Arrange
      mockReq.params = { commentId: "mocked-uuid" };
      mockReq.body = {};

      // Act
      await commentHandler.updateComment(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe("Content is required");
    });
  });

  describe("deleteCommentById", () => {
    it("should delete comment successfully", async () => {
      // Arrange
      mockReq.params = { commentId: "mocked-uuid" };
      commentQuery.deleteCommentById.mockResolvedValue(1);

      // Act
      await commentHandler.deleteCommentById(mockReq, mockRes, mockNext);

      // Assert
      expect(commentQuery.deleteCommentById).toHaveBeenCalledWith(
        "mocked-uuid"
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: "Comment deleted successfully",
      });
    });
  });
});
