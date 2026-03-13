import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeClosed } from "lucide-react";
import doodle from "../../../assets/sidebar/doodle.svg";
import csi from "../../../assets/csi.svg";
import ace from "../../../assets/ace.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ Mobile screen block (real screen width, cannot be spoofed by devtools)
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  useEffect(() => {
    const screenWidth = window.screen.width;
    if (screenWidth < 1024) {
      setIsMobileScreen(true);
    }
  }, []);

  const encryptPassword = async (rawPassword) => {
    const SECRET_KEY = import.meta.env.VITE_KEY?.slice(0, 32); // 32 bytes
    const IV = import.meta.env.VITE_IV?.slice(0, 16);           // 16 bytes

    const encodedPassword = new TextEncoder().encode(rawPassword);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET_KEY),
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: new TextEncoder().encode(IV) },
      cryptoKey,
      encodedPassword
    );

    return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const encryptedPassword = await encryptPassword(password);
      const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

      const response = await axios.post(
        `${API_BASE_URL}/api/users/login`,
        { email, password: encryptedPassword },
        {
          withCredentials: true,
          headers: { "X-Screen-Width": window.screen.width },
        }
      );

      if (response.data.message === "Login Successful") {
        const userData = response.data.result;

        if (userData.status === "NOTACTIVE") {
          navigate(`/reset-password/${response.headers.resettoken}`);
        } else if (userData.status === "ACTIVE") {
          switch (userData.role) {
            case "Student":
              navigate("/home", { replace: true });
              break;
            case "TPO":
              navigate("/admin", { replace: true });
              break;
            case "Department":
              navigate("/department", { replace: true });
              break;
            case "Teacher":
              navigate("/teacher", { replace: true });
              break;
            case "President":
              navigate("/president", { replace: true });
              break;
            default:
              setError("Unauthorized role");
          }
        } else {
          setError("Unexpected status");
        }
      } else {
        setError("Invalid login credentials");
      }
    } catch (err) {
      console.log(err);
      if (err.response?.data?.error === "Invalid email or password") {
        setError("Invalid Email or Password!");
      } else if (err.response?.data?.error === "User not found") {
        setError("User Not Found!");
      } else if (err.response?.status === 403) {
        setError("Login through desktop only");
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Block mobile users — shown ONLY when real screen width < 1024
  if (isMobileScreen) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-bold text-red-700 text-center px-4">
        ❌ Login is strictly allowed only on desktop devices.
      </div>
    );
  }

  // ✅ Desktop layout — no xs breakpoint needed, mobile is already blocked above
  return (
    <div className="flex flex-row h-screen relative">
      {/* Logos */}
      <img
        src={ace}
        alt="ACE Logo"
        className="absolute top-4 left-4 w-12 h-12 md:w-16 md:h-16 z-10"
      />
      <img
        src={csi}
        alt="CSI logo"
        className="absolute top-4 left-24 w-12 h-12 md:w-16 md:h-16 z-10"
      />

      {/* Left Section — gradient panel with form */}
      <div className="w-full md:w-1/3 relative flex flex-col items-center p-6 bg-gradient-to-br from-[#0E2A47] to-[#04448D]">
        <div className="relative z-10 flex flex-col items-center w-full max-w-xs text-center text-white">
          <div className="w-full text-center mb-6 mt-16">
            <h1 className="text-3xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-wide">
              Aptitude <br />
              <span>Portal</span>
            </h1>
            <p className="mt-3 text-base md:text-lg">
              Turn your exams into success stories
            </p>
          </div>

          <div className="mt-20 w-full">
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <h2 className="text-2xl md:text-3xl font-bold mb-5">Login</h2>
              {error && <div className="text-red-400 mb-2">{error}</div>}
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeClosed /> : <Eye />}
                </button>
              </div>
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white rounded-xl shadow-md transition transform hover:scale-105 ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section — doodle illustration */}
      <div className="md:w-2/3 bg-gray-50 flex justify-center items-center relative">
        <img
          src={doodle}
          alt="Student Illustration"
          className="max-w-[90%] md:max-w-[70%] lg:max-w-[50%] h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default Login;
