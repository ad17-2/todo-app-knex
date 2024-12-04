const organizationHandler = require("../handler/organizations");
const organizationQueries = require("../database/queries/organizations");
const { BadRequestError, NotFoundError } = require("../errors/app-error");

// Mock the uuidv7 function
jest.mock("uuidv7", () => ({
  uuidv7: () => "mocked-uuid",
}));

// Mock the database queries
jest.mock("../database/queries/organizations");

describe("Organization Handler", () => {
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

  describe("createOrganization", () => {
    it("should create an organization successfully", async () => {
      // Arrange
      const mockOrganization = {
        id: "mocked-uuid",
        name: "Test Organization",
      };

      mockReq.body = {
        name: "Test Organization",
      };

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
      mockReq.body = { name: "Ab" };

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
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("getOrganizations", () => {
    it("should return all organizations successfully", async () => {
      // Arrange
      const mockOrganizations = [
        { id: "1", name: "Org 1" },
        { id: "2", name: "Org 2" },
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
        id: "mocked-uuid",
        name: "Test Organization",
      };

      mockReq.params = { id: "mocked-uuid" };
      organizationQueries.getOrganizationById.mockResolvedValue(
        mockOrganization
      );

      // Act
      await organizationHandler.getOrganizationById(mockReq, mockRes, mockNext);

      // Assert
      expect(organizationQueries.getOrganizationById).toHaveBeenCalledWith(
        "mocked-uuid"
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrganization,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if organization doesn't exist", async () => {
      // Arrange
      mockReq.params = { id: "non-existent-id" };
      organizationQueries.getOrganizationById.mockResolvedValue(null);

      // Act
      await organizationHandler.getOrganizationById(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("Organization not found");
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("updateOrganizationById", () => {
    it("should update organization successfully", async () => {
      // Arrange
      const mockOrganization = {
        id: "mocked-uuid",
        name: "Updated Organization",
      };

      mockReq.params = { id: "mocked-uuid" };
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
      expect(organizationQueries.updateOrganization).toHaveBeenCalledWith(
        "mocked-uuid",
        { name: "Updated Organization" }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrganization,
      });
    });

    it("should throw BadRequestError if name is missing", async () => {
      // Arrange
      mockReq.params = { id: "mocked-uuid" };
      mockReq.body = {};

      // Act
      await organizationHandler.updateOrganizationById(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe(
        "Organization name is required"
      );
    });

    it("should throw BadRequestError if name is too short", async () => {
      // Arrange
      mockReq.params = { id: "mocked-uuid" };
      mockReq.body = { name: "Ab" };

      // Act
      await organizationHandler.updateOrganizationById(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
      expect(mockNext.mock.calls[0][0].message).toBe(
        "Organization name is too short"
      );
    });
  });

  describe("deleteOrganizationById", () => {
    it("should delete organization successfully", async () => {
      // Arrange
      mockReq.params = { id: "mocked-uuid" };
      organizationQueries.deleteOrganization.mockResolvedValue(1);

      // Act
      await organizationHandler.deleteOrganizationById(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(organizationQueries.deleteOrganization).toHaveBeenCalledWith(
        "mocked-uuid"
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
      });
    });

    it("should handle database errors", async () => {
      // Arrange
      const dbError = new Error("Database error");
      mockReq.params = { id: "mocked-uuid" };
      organizationQueries.deleteOrganization.mockRejectedValue(dbError);

      // Act
      await organizationHandler.deleteOrganizationById(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(dbError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("getOrganizationUsers", () => {
    it("should return organization users successfully", async () => {
      // Arrange
      const mockOrganization = { id: "mocked-uuid", name: "Test Org" };
      const mockUsers = [
        { id: "1", name: "User 1" },
        { id: "2", name: "User 2" },
      ];

      mockReq.params = { id: "mocked-uuid" };
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
      expect(organizationQueries.getOrganizationUsers).toHaveBeenCalledWith(
        "mocked-uuid"
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
      });
    });

    it("should throw NotFoundError if organization doesn't exist", async () => {
      // Arrange
      mockReq.params = { id: "non-existent-id" };
      organizationQueries.getOrganizationById.mockResolvedValue(null);

      // Act
      await organizationHandler.getOrganizationUsers(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("Organization not found");
    });
  });

  describe("getOrganizationProjects", () => {
    it("should return organization projects successfully", async () => {
      // Arrange
      const mockOrganization = { id: "mocked-uuid", name: "Test Org" };
      const mockProjects = [
        { id: "1", name: "Project 1" },
        { id: "2", name: "Project 2" },
      ];

      mockReq.params = { id: "mocked-uuid" };
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
      expect(organizationQueries.getOrganizationProjects).toHaveBeenCalledWith(
        "mocked-uuid"
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockProjects,
      });
    });

    it("should throw NotFoundError if organization doesn't exist", async () => {
      // Arrange
      mockReq.params = { id: "non-existent-id" };
      organizationQueries.getOrganizationById.mockResolvedValue(null);

      // Act
      await organizationHandler.getOrganizationProjects(
        mockReq,
        mockRes,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockNext.mock.calls[0][0].message).toBe("Organization not found");
    });
  });
});
