const projectUserHandler = require("../handler/project_users");
const userQuery = require("../database/queries/users");
const projectQuery = require("../database/queries/projects");
const projectUserQuery = require("../database/queries/project_users");
const { BadRequestError, NotFoundError } = require("../errors/app-error");

// Mock the uuidv7 function
jest.mock("uuidv7", () => ({
  uuidv7: () => "mocked-uuid",
}));

// Mock the database queries
jest.mock("../database/queries/users");
jest.mock("../database/queries/projects");
jest.mock("../database/queries/project_users");

describe("Project User Handler", () => {
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

  describe("createProjectUser", () => {
    it("should create a project user successfully", async () => {
      // Arrange
      const mockProject = { id: "project-1", name: "Test Project" };
      const mockUser = { id: "user-1", name: "Test User" };
      const mockProjectUser = {
        id: "mocked-uuid",
        project_id: "project-1",
        user_id: "user-1",
      };

      mockReq.body = {
        projectId: "project-1",
        userId: "user-1",
      };

      projectQuery.getProjectById.mockResolvedValue(mockProject);
      userQuery.getUserById.mockResolvedValue(mockUser);
      projectUserQuery.getProjectUser.mockResolvedValue(null);
      projectUserQuery.createProjectUser.mockResolvedValue(mockProjectUser);

      // Act
      await projectUserHandler.createProjectUser(mockReq, mockRes, mockNext);

      // Assert
      expect(projectQuery.getProjectById).toHaveBeenCalledWith("project-1");
      expect(userQuery.getUserById).toHaveBeenCalledWith("user-1");
      expect(projectUserQuery.createProjectUser).toHaveBeenCalledWith({
        id: "mocked-uuid",
        project_id: "project-1",
        user_id: "user-1",
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: mockProjectUser,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if project doesn't exist", async () => {
      // Arrange
      mockReq.body = {
        projectId: "non-existent-project",
        userId: "user-1",
      };

      projectQuery.getProjectById.mockResolvedValue(null);

      // Act
      await projectUserHandler.createProjectUser(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("Project not found");
      expect(projectUserQuery.createProjectUser).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if user doesn't exist", async () => {
      // Arrange
      const mockProject = { id: "project-1", name: "Test Project" };

      mockReq.body = {
        projectId: "project-1",
        userId: "non-existent-user",
      };

      projectQuery.getProjectById.mockResolvedValue(mockProject);
      userQuery.getUserById.mockResolvedValue(null);

      // Act
      await projectUserHandler.createProjectUser(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("User not found");
      expect(projectUserQuery.createProjectUser).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if user is already a project member", async () => {
      // Arrange
      const mockProject = { id: "project-1", name: "Test Project" };
      const mockUser = { id: "user-1", name: "Test User" };
      const mockExistingProjectUser = {
        project_id: "project-1",
        user_id: "user-1",
      };

      mockReq.body = {
        projectId: "project-1",
        userId: "user-1",
      };

      projectQuery.getProjectById.mockResolvedValue(mockProject);
      userQuery.getUserById.mockResolvedValue(mockUser);
      projectUserQuery.getProjectUser.mockResolvedValue(
        mockExistingProjectUser
      );

      // Act
      await projectUserHandler.createProjectUser(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe(
        "User is already a member of the project"
      );
      expect(projectUserQuery.createProjectUser).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Arrange
      const mockProject = { id: "project-1", name: "Test Project" };
      const mockUser = { id: "user-1", name: "Test User" };
      const dbError = new Error("Database error");

      mockReq.body = {
        projectId: "project-1",
        userId: "user-1",
      };

      projectQuery.getProjectById.mockResolvedValue(mockProject);
      userQuery.getUserById.mockResolvedValue(mockUser);
      projectUserQuery.getProjectUser.mockResolvedValue(null);
      projectUserQuery.createProjectUser.mockRejectedValue(dbError);

      // Act
      await projectUserHandler.createProjectUser(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("removeProjectUser", () => {
    it("should remove project user successfully", async () => {
      // Arrange
      mockReq.params = {
        projectId: "project-1",
        userId: "user-1",
      };

      projectUserQuery.removeProjectUser.mockResolvedValue(1);

      // Act
      await projectUserHandler.removeProjectUser(mockReq, mockRes, mockNext);

      // Assert
      expect(projectUserQuery.removeProjectUser).toHaveBeenCalledWith(
        "project-1",
        "user-1"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Arrange
      const dbError = new Error("Database error");
      mockReq.params = {
        projectId: "project-1",
        userId: "user-1",
      };

      projectUserQuery.removeProjectUser.mockRejectedValue(dbError);

      // Act
      await projectUserHandler.removeProjectUser(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
