import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await api.post("/login", formData);
      console.log("✅ Login successful:", response.data);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      setErrorMsg(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2">
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
              required
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
              required
            />
          </div>

          {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

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
