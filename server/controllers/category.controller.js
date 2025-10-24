import Category from "../models/category.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user?._id || "68e7dee469d4b71029272c39"; // fallback for testing
    const newCategory = new Category({ name, user: userId });
    const savedCategory = await newCategory.save();
    res.status(201).json({
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findOneAndDelete({
      _id: id,
    });
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      { name },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};
