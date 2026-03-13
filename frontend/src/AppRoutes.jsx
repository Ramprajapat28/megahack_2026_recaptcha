import React from "react";
import { Route, Routes } from "react-router-dom";
// import { useSelector } from "react-redux";

// Pages
import Login from "./pages/Login";

import MCQExamPage from "./pages/student/Stu_MCQExamPage";
import ResetPassword from "./pages/student/Stu_ResetPassword";
import Stu_Dashboard from "./pages/student/Stu_Dashboard";
import Stu_UpcomingTest from "./pages/student/Stu_UpcomingTest";
import Stu_TestInstruction from "./pages/student/Stu_TestInstruction";
import Stu_Analytics from "./pages/student/Stu_Analytics";
import Stu_Result from "./pages/student/Stu_Result";

import Adm_Dashboard from "./pages/admin/Adm_Dashboard";
import Adm_CreateTestForm from "./pages/admin/Adm_CreateTestForm";
import Adm_DraftTest from "./pages/admin/Adm_DraftTest";
import Adm_ScheduleTest from "./pages/admin/Adm_ScheduleTest";
import Adm_PastTest from "./pages/admin/Adm_PastTest";
import Adm_LiveTest from "./pages/admin/Adm_LiveTest";
import Adm_InputQuestions from "./pages/admin/Adm_InputQuestions";
import Adm_ViewQuestions from "./pages/admin/Adm_ViewQuestions";
import Adm_StudentList from "./pages/admin/Adm_StudentList";
import Adm_TestStudentList from "./pages/admin/Adm_TestStudentList";
import Adm_Analytics from "./pages/admin/Adm_Analytics";
import Adm_StudentAnalysis from "./pages/admin/Adm_StudentAnalysis";
import Adm_StudentAnalytics from "./pages/admin/Adm_StudentAnalytics";
import Adm_OverallScore from "./pages/admin/Adm_OverallScore";
import Adm_McqGenerator from "./pages/admin/Adm_McqGenerator";



// Protected Route Component
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />

      {/* Student Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Stu_Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-instruction"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Stu_TestInstruction />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <MCQExamPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upcoming-tests"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Stu_UpcomingTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Stu_Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="user/results"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Stu_Result />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/analytics/:user_id"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <Stu_Analytics />
          </ProtectedRoute>
        }
      /> */}

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/createtest"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_CreateTestForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/input"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_InputQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/viewquestions"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_ViewQuestions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/studentlist"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_StudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teststudentlist"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_TestStudentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drafted-tests"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_DraftTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scheduled-tests"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_ScheduleTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/past-tests"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_PastTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live-tests"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_LiveTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student-analysis"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_StudentAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student-analytics"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_StudentAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/overall-score"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_OverallScore />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/mcq-generator"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Adm_McqGenerator />
          </ProtectedRoute>
        }
      />

   
     
      <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes;
