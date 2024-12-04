const organizationHandler = require("../handler/organizations");
const organizationQueries = require("../database/queries/organizations");
const { BadRequestError, NotFoundError } = require("../errors/app-error");

// Mock the uuidv7 function
jest.mock("uuidv7", () => ({
  uuidv7: () => "mocked-uuid",
}));

// Mock the database queries
jest.mock("../database/queries/organizations");

describe("Organization Controller", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request, response, and next function
    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("createOrganization", () => {
    it("should create an organization successfully", async () => {
      // Arrange
      const mockOrganization = {
        id: "mocked-uuid",
        name: "Test Organization",
      };

      mockReq.body = { name: "Test Organization" };

      organizationQueries.createOrganization.mockResolvedValue([
        mockOrganization,
      ]);

      // Act
      await organizationHandler.createOrganization(mockReq, mockRes, mockNext);

      // Assert
      expect(organizationQueries.createOrganization).toHaveBeenCalledWith({
        id: "mocked-uuid",
        name: "Test Organization",
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrganization,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if name is missing", async () => {
      // Arrange
      mockReq.body = {};

      // Act
      await organizationHandler.createOrganization(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe(
        "Organization name is required"
      );
      expect(organizationQueries.createOrganization).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if name is too short", async () => {
      // Arrange
      mockReq.body = { name: "ab" };

      // Act
      await organizationHandler.createOrganization(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe(
        "Organization name is too short"
      );
      expect(organizationQueries.createOrganization).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Arrange
      const dbError = new Error("Database error");
      mockReq.body = { name: "Test Organization" };
      organizationQueries.createOrganization.mockRejectedValue(dbError);

      // Act
      await organizationHandler.createOrganization(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("getOrganizations", () => {
    it("should return organizations successfully", async () => {
      // Arrange
      const mockOrganizations = [
        { id: 1, name: "Org 1" },
        { id: 2, name: "Org 2" },
      ];

      organizationQueries.getOrganizations.mockResolvedValue(mockOrganizations);

      // Act
      await organizationHandler.getOrganizations(mockReq, mockRes, mockNext);

      // Assert
      expect(organizationQueries.getOrganizations).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrganizations,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Arrange
      const dbError = new Error("Database error");
      organizationQueries.getOrganizations.mockRejectedValue(dbError);

      // Act
      await organizationHandler.getOrganizations(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("getOrganizationById", () => {
    it("should return organization by ID successfully", async () => {
      // Arrange
      const mockOrganization = {
        id: 1,
        name: "Test Organization",
        created_at: "2021-01-01T00:00:00.000Z",
      };

      mockReq.params = { id: 1 };

      organizationQueries.getOrganizationById.mockResolvedValue(
        mockOrganization
      );

      // Act
      await organizationHandler.getOrganizationById(mockReq, mockRes, mockNext);

      // Assert
      expect(organizationQueries.getOrganizationById).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrganization,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Arrange
      const dbError = new Error("Database error");
      mockReq.params = { id: 1 };

      organizationQueries.getOrganizationById.mockRejectedValue(dbError);

      // Act
      await organizationHandler.getOrganizationById(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("updateOrganizationById", () => {
    it("should update organization by ID successfully", async () => {
      // Arrange
      const mockOrganization = {
        id: 1,
        name: "Test Organization",
        created_at: "2021-01-01T00:00:00.000Z",
      };

      mockReq.params = { id: 1 };
      mockReq.body = { name: "Updated Organization" };

      organizationQueries.updateOrganization.mockResolvedValue(
        mockOrganization
      );

      // Act
      await organizationHandler.updateOrganizationById(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(organizationQueries.updateOrganization).toHaveBeenCalledWith(1, {
        name: "Updated Organization",
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrganization,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("deleteOrganizationById", () => {
    it("should delete organization by ID successfully", async () => {
      // Arrange
      mockReq.params = { id: 1 };
      organizationQueries.deleteOrganization.mockResolvedValue(1);

      // Act
      await organizationHandler.deleteOrganizationById(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(organizationQueries.deleteOrganization).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getOrganizationUsers", () => {
    it("should return error when organization not found", async () => {
      // Arrange
      mockReq.params = { id: 1 };

      organizationQueries.getOrganizationById.mockResolvedValue(null);

      // Act
      await organizationHandler.getOrganizationUsers(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(organizationQueries.getOrganizationById).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should return organization users successfully", async () => {
      // Arrange
      const mockOrganization = {
        id: 1,
        name: "Test Organization",
        created_at: "2021-01-01T00:00:00.000Z",
      };

      const mockUsers = [{ id: 1, name: "User 1", email: "budi@gmail.com" }];

      mockReq.params = { id: 1 };

      organizationQueries.getOrganizationById.mockResolvedValue(
        mockOrganization
      );

      organizationQueries.getOrganizationUsers.mockResolvedValue(mockUsers);

      // Act
      await organizationHandler.getOrganizationUsers(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(organizationQueries.getOrganizationById).toHaveBeenCalledWith(1);
      expect(organizationQueries.getOrganizationUsers).toHaveBeenCalledWith(1);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });
  });

  describe("getOrganizationProjects", () => {
    it("should return error when organization not found", async () => {
      // Arrange
      mockReq.params = { id: 1 };

      organizationQueries.getOrganizationById.mockResolvedValue(null);

      // Act
      await organizationHandler.getOrganizationProjects(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(organizationQueries.getOrganizationById).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should return organization projects successfully", async () => {
      // Arrange
      const mockOrganization = {
        id: 1,
        name: "Test Organization",
        created_at: "2021-01-01T00:00:00.000Z",
      };

      const mockProjects = [
        { id: 1, name: "Project 1", description: "Project 1 description" },
      ];

      mockReq.params = { id: 1 };

      organizationQueries.getOrganizationById.mockResolvedValue(
        mockOrganization
      );

      organizationQueries.getOrganizationProjects.mockResolvedValue(
        mockProjects
      );

      // Act
      await organizationHandler.getOrganizationProjects(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(organizationQueries.getOrganizationById).toHaveBeenCalledWith(1);
      expect(organizationQueries.getOrganizationProjects).toHaveBeenCalledWith(
        1
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProjects,
      });
    });
  });
});
