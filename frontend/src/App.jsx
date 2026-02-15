import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashobard';
import ProjectDetails from "./components/ProjectDetails";
import Invite from "./components/Invite";
import NewProject from "./components/NewProject";
import AddTask from "./components/AddTask";
import UpdateTask from "./components/UpdateTask";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={<ProjectDetails />}
        />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/projects/:projectId/invite"
          element={<Invite />}
        />
        <Route path="/new-project" element={<NewProject />} />
        <Route
          path="/projects/:projectId/add-task"
          element={<AddTask />}
        />
        <Route
          path="/projects/:projectId/update-task/:taskId"
          element={<UpdateTask />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
