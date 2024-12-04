const userHandler = require("../handler/users");
const userQuery = require("../database/queries/users");
const organizationQuery = require("../database/queries/organizations");
const { BadRequestError, NotFoundError } = require("../errors/app-error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mock the required modules
jest.mock("../database/queries/users");
jest.mock("../database/queries/organizations");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("uuidv7", () => ({
  uuidv7: () => "mocked-uuid",
}));

describe("User Handler", () => {
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
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("Login", () => {
    beforeEach(() => {
      mockReq.body = {
        email: "john@example.com",
        password: "StrongP@ss123",
      };
    });

    describe("validation checks", () => {
      it("should throw BadRequestError if email is missing", async () => {
        mockReq.body = { password: "StrongP@ss123" };
        await userHandler.login(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockNext.mock.calls[0][0].message).toBe(
          "Email and password are required"
        );
      });

      it("should throw BadRequestError if password is missing", async () => {
        mockReq.body = { email: "john@example.com" };
        await userHandler.login(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockNext.mock.calls[0][0].message).toBe(
          "Email and password are required"
        );
      });
    });
  });

  describe("createUsers", () => {
    beforeEach(() => {
      mockReq.body = {
        name: "John Doe",
        email: "john@example.com",
        organizationId: 1,
        password: "StrongP@ss123",
        role: "admin",
      };
    });

    describe("validation checks", () => {
      it("should throw BadRequestError if required fields are missing", async () => {
        const testCases = [
          { ...mockReq.body, name: undefined },
          { ...mockReq.body, email: undefined },
          { ...mockReq.body, organizationId: undefined },
          { ...mockReq.body, password: undefined },
          { ...mockReq.body, role: undefined },
        ];

        for (const testCase of testCases) {
          mockReq.body = testCase;
          await userHandler.createUsers(mockReq, mockRes, mockNext);
          expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
          expect(mockNext.mock.calls[0][0].message).toBe(
            "Name, email, password, role, and organization ID are required"
          );
          jest.clearAllMocks();
        }
      });

      it("should throw BadRequestError for invalid role", async () => {
        mockReq.body.role = "invalid-role";
        await userHandler.createUsers(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockNext.mock.calls[0][0].message).toBe(
          "Role must be either admin or staff"
        );
      });

      it("should throw BadRequestError if password is too long", async () => {
        mockReq.body.password = "A".repeat(73);
        await userHandler.createUsers(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockNext.mock.calls[0][0].message).toBe(
          "Password must be less than 72"
        );
      });
    });

    describe("success cases", () => {
      it("should create user successfully with valid input", async () => {
        const mockUser = {
          id: "mocked-uuid",
          name: "John Doe",
          email: "john@example.com",
          organization_id: 1,
          role: "admin",
        };

        userQuery.getUserByEmail.mockResolvedValue(null);
        organizationQuery.getOrganizationById.mockResolvedValue({ id: 1 });
        userQuery.createUser.mockResolvedValue([mockUser]);

        await userHandler.createUsers(mockReq, mockRes, mockNext);

        expect(userQuery.createUser).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "mocked-uuid",
            name: "John Doe",
            email: "john@example.com",
            organization_id: 1,
            role: "admin",
          })
        );
        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          data: mockUser,
        });
      });
    });
  });

  describe("getUsers", () => {
    it("should return all users successfully", async () => {
      const mockUsers = [
        { id: "1", name: "John" },
        { id: "2", name: "Jane" },
      ];
      userQuery.getUsers.mockResolvedValue(mockUsers);

      await userHandler.getUsers(mockReq, mockRes, mockNext);

      expect(userQuery.getUsers).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      userQuery.getUsers.mockRejectedValue(error);

      await userHandler.getUsers(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserById", () => {
    beforeEach(() => {
      mockReq.params.id = "mocked-uuid";
    });

    it("should return user by ID successfully", async () => {
      const mockUser = { id: "mocked-uuid", name: "John" };
      userQuery.getUserById.mockResolvedValue([mockUser]);

      await userHandler.getUserById(mockReq, mockRes, mockNext);

      expect(userQuery.getUserById).toHaveBeenCalledWith("mocked-uuid");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it("should throw NotFoundError if user doesn't exist", async () => {
      userQuery.getUserById.mockResolvedValue([]);

      await userHandler.getUserById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("User not found");
    });
  });

  describe("updateUserById", () => {
    beforeEach(() => {
      mockReq.params.id = "mocked-uuid";
      mockReq.body = {
        name: "John Updated",
        email: "john.updated@example.com",
        organizationId: 1,
      };
    });

    it("should update user successfully", async () => {
      const mockUser = {
        id: "mocked-uuid",
        name: "John Updated",
        email: "john.updated@example.com",
        organization_id: 1,
      };

      userQuery.getUserById.mockResolvedValue(mockUser);
      organizationQuery.getOrganizationById.mockResolvedValue({ id: 1 });
      userQuery.updateUser.mockResolvedValue([mockUser]);

      await userHandler.updateUserById(mockReq, mockRes, mockNext);

      expect(userQuery.updateUser).toHaveBeenCalledWith("mocked-uuid", {
        name: "John Updated",
        email: "john.updated@example.com",
        organization_id: 1,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it("should throw BadRequestError if required fields are missing", async () => {
      const testCases = [
        { ...mockReq.body, name: undefined },
        { ...mockReq.body, email: undefined },
        { ...mockReq.body, organizationId: undefined },
      ];

      for (const testCase of testCases) {
        mockReq.body = testCase;
        await userHandler.updateUserById(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockNext.mock.calls[0][0].message).toBe(
          "Name, email, and organization ID are required"
        );
        jest.clearAllMocks();
      }
    });
  });

  describe("deleteUserById", () => {
    beforeEach(() => {
      mockReq.params.id = "mocked-uuid";
    });

    it("should delete user successfully", async () => {
      userQuery.deleteUserById.mockResolvedValue(1);

      await userHandler.deleteUserById(mockReq, mockRes, mockNext);

      expect(userQuery.deleteUserById).toHaveBeenCalledWith("mocked-uuid");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      userQuery.deleteUserById.mockRejectedValue(error);

      await userHandler.deleteUserById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserProjects", () => {
    beforeEach(() => {
      mockReq.params.id = "mocked-uuid";
    });

    it("should return user projects successfully", async () => {
      const mockProjects = [
        { id: 1, name: "Project 1" },
        { id: 2, name: "Project 2" },
      ];
      userQuery.getUserProjects.mockResolvedValue(mockProjects);

      await userHandler.getUserProjects(mockReq, mockRes, mockNext);

      expect(userQuery.getUserProjects).toHaveBeenCalledWith("mocked-uuid");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProjects,
      });
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      userQuery.getUserProjects.mockRejectedValue(error);

      await userHandler.getUserProjects(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserTodos", () => {
    beforeEach(() => {
      mockReq.params.id = "mocked-uuid";
    });

    it("should return user todos successfully", async () => {
      const mockTodos = [
        { id: 1, title: "Todo 1" },
        { id: 2, title: "Todo 2" },
      ];
      userQuery.getUserTodos.mockResolvedValue(mockTodos);

      await userHandler.getUserTodos(mockReq, mockRes, mockNext);

      expect(userQuery.getUserTodos).toHaveBeenCalledWith("mocked-uuid");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodos,
      });
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      userQuery.getUserTodos.mockRejectedValue(error);

      await userHandler.getUserTodos(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
