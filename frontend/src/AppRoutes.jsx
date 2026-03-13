import { Routes, Route } from "react-router-dom";
import Login from "./features/login/screens/Login";

// Placeholder pages — will be replaced as admin/student features are implemented
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-screen text-2xl font-bold text-gray-600">
    {title} — Coming Soon
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/reset-password/:resettoken" element={<Placeholder title="Reset Password" />} />

      {/* Student (placeholder) */}
      <Route path="/home" element={<Placeholder title="Student Dashboard" />} />

      {/* Admin (placeholder) */}
      <Route path="/admin" element={<Placeholder title="Admin Dashboard" />} />

      {/* Other roles (placeholder) */}
      <Route path="/department" element={<Placeholder title="Department Dashboard" />} />
      <Route path="/teacher"    element={<Placeholder title="Teacher Dashboard" />} />
      <Route path="/president"  element={<Placeholder title="President Dashboard" />} />

      {/* 404 */}
      <Route path="*" element={<Placeholder title="404 – Page Not Found" />} />
    </Routes>
  );
};

export default AppRoutes;
