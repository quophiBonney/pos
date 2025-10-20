import Role from "../models/role.model.js";
import Permission from "../models/permission.model.js";

// ✅ Create single or multiple roles
export const createRole = async (req, res) => {
  try {
    const isArrayInput = Array.isArray(req.body);
    const rolesData = isArrayInput ? req.body : [req.body];

    // Validate input
    for (const r of rolesData) {
      if (!r.name || r.name.trim() === "") {
        return res.status(400).json({ message: "Each role must have a name" });
      }
    }

    // Normalize data
    const formattedRoles = rolesData.map((r) => ({
      name: r.name.trim(),
      description: r.description?.trim() || "",
      permissions: r.permissions || [],
    }));

    // Check for existing roles
    const existingRoles = await Role.find({
      name: { $in: formattedRoles.map((r) => r.name) },
    });

    if (existingRoles.length > 0) {
      const existingNames = existingRoles.map((r) => r.name);
      return res.status(400).json({
        message: `These roles already exist: ${existingNames.join(", ")}`,
      });
    }

    // Validate permissions for all roles
    for (const r of formattedRoles) {
      if (r.permissions && r.permissions.length > 0) {
        const validPermissions = await Permission.find({
          _id: { $in: r.permissions },
        });
        if (validPermissions.length !== r.permissions.length) {
          return res.status(400).json({
            message: `Invalid permissions for role "${r.name}"`,
          });
        }
      }
    }

    // Create roles
    const createdRoles = await Role.insertMany(formattedRoles);

    res.status(201).json({
      message: isArrayInput
        ? "Roles created successfully"
        : "Role created successfully",
      count: createdRoles.length,
      data: createdRoles,
    });
  } catch (error) {
    console.error("Create Role Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all roles with permissions
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions", "name description");
    res.status(200).json({
      data: roles,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get a single role by ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate(
      "permissions",
      "name description"
    );
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update a role
export const updateRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Validate permissions if provided
    if (permissions && permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: permissions },
      });
      if (validPermissions.length !== permissions.length) {
        return res.status(400).json({ message: "Some permissions are invalid" });
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions },
      { new: true, runValidators: true }
    ).populate("permissions", "name description");

    if (!updatedRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json({ message: "Role updated successfully", role: updatedRole });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete a role
export const deleteRole = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
