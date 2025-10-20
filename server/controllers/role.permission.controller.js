import Role from "../models/role.model.js";
import Permission from "../models/permission.model.js";

// Assign permissions to role
export const assignPermissionsToRole = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;

    const role = await Role.findById(roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });

    // Validate permissions
    const validPermissions = await Permission.find({ _id: { $in: permissions } });
    if (validPermissions.length !== permissions.length) {
      return res.status(400).json({ message: "Some permissions are invalid" });
    }

    role.permissions = permissions;
    await role.save();

    res.json({ message: "Permissions assigned", role });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
