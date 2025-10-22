import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import api from "../../utils/api";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", formData);
      console.log("✅ Login successful:", response.data);

      // Save user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // ✅ Show success toast
      toast.current.show({
        severity: "success",
        summary: "Login Successful",
        detail: "Redirecting to dashboard...",
        life: 2000,
      });

      // Redirect after short delay (so user sees the toast)
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      toast.current.show({
        severity: "error",
        summary: "Login Failed",
        detail: error.response?.data?.message || "Invalid credentials",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* PrimeReact Toast */}
      <Toast ref={toast} />

      {/* Image section */}
      <div>
        <img
          src="https://images.pexels.com/photos/12935088/pexels-photo-12935088.jpeg"
          alt="Login Background"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Form section */}
      <div className="flex items-center px-5 lg:px-10 xl:px-16">
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-10">
            <h3 className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold uppercase">
              Welcome Back!
            </h3>
            <p>Fill the form below to log into your account</p>
          </div>

          <div className="form-group mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 xl:p-4 bg-gray-100 border-2 border-gray-200 rounded"
            />
          </div>

          <div className="form-group mb-6">
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 xl:p-4 bg-gray-100 border-2 border-gray-200 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            } text-white w-full p-3 xl:p-4 rounded transition`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
