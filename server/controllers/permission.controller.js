import Permission from "../models/permission.model.js";

export const createPermission = async (req, res) => {
  try {
    let { name, description } = req.body;

    // Detect if input is an array or a single object
    const isArrayInput = Array.isArray(req.body);

    // Normalize input into an array for unified handling
    const permissionsData = isArrayInput ? req.body : [{ name, description }];

    // Validate each permission entry
    for (const p of permissionsData) {
      if (!p.name || p.name.trim() === "") {
        return res.status(400).json({ message: "Each permission must have a name" });
      }
    }

    // Normalize names to lowercase and trim spaces
    const formattedPermissions = permissionsData.map((p) => ({
      name: p.name.trim().toLowerCase(),
      description: p.description ? p.description.trim() : "",
    }));

    // Check for duplicates (in DB)
    const names = formattedPermissions.map((p) => p.name);
    const existingPermissions = await Permission.find({ name: { $in: names } });
    const existingNames = existingPermissions.map((p) => p.name);

    // Filter out already existing ones
    const newPermissions = formattedPermissions.filter(
      (p) => !existingNames.includes(p.name)
    );

    if (newPermissions.length === 0) {
      return res.status(400).json({ message: "All permissions already exist" });
    }

    // Insert new permissions
    const createdPermissions = await Permission.insertMany(newPermissions);

    return res.status(201).json({
      message: isArrayInput
        ? "Permissions created successfully"
        : "Permission created successfully",
      count: createdPermissions.length,
      data: createdPermissions,
    });
  } catch (error) {
    console.error("Error creating permissions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all permissions
export const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ name: 1 });
    return res.status(200).json({
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
