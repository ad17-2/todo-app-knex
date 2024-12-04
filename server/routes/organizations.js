const express = require("express");
const router = express.Router();
const organizationHandler = require("../handler/organizations");
const adminOnly = require("../middleware/admin-authentication");

router.post(
  "/organizations/",
  adminOnly,
  organizationHandler.createOrganization
);
router.get("/organizations/", adminOnly, organizationHandler.getOrganizations);
router.get(
  "/organizations/:id",
  adminOnly,
  organizationHandler.getOrganizationById
);
router.put(
  "/organizations/:id",
  adminOnly,
  organizationHandler.updateOrganizationById
);
router.delete(
  "/organizations/:id",
  adminOnly,
  organizationHandler.deleteOrganizationById
);
router.get(
  "/organizations/:id/users",
  adminOnly,
  organizationHandler.getOrganizationUsers
);
router.get(
  "/organizations/:id/projects",
  adminOnly,
  organizationHandler.getOrganizationProjects
);

module.exports = router;
