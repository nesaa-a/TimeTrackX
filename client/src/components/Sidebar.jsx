import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Clock,
  LogOut,
  UserPlus,
  ShieldCheck,
  ClipboardList,
  List
} from "lucide-react";
import { useState, useEffect } from "react";

function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "hr") {
      setIsHR(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const baseItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Clock size={20} />, label: "Check-In", path: "/checkin" },
    { icon: <User size={20} />, label: "Profile", path: "/profile" },
    { icon: <List size={20} />, label: "My Tasks", path: "/my-tasks" }, // ✅ added for all users
  ];

  const hrItems = [
    { icon: <UserPlus size={20} />, label: "Create User", path: "/create-user" },
    { icon: <ShieldCheck size={20} />, label: "Admin Dashboard", path: "/admin" },
    { icon: <ClipboardList size={20} />, label: "Task Manager", path: "/tasks" },
  ];

  const menuItems = isHR ? [...baseItems, ...hrItems] : baseItems;

  return (
    <div
      className={`h-screen bg-black/30 backdrop-blur-md border-r border-gray-800 text-white flex flex-col justify-between transition-all duration-300 ${
        expanded ? "w-52" : "w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex flex-col mt-6 space-y-2 px-2">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer group transition-all duration-200 ${
              currentPath === item.path
                ? "bg-indigo-600/20 border-l-4 border-indigo-500"
                : "hover:bg-gray-800/60"
            }`}
          >
            <div className="group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </div>
            {expanded && (
              <span className="text-sm text-gray-100 font-medium">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        onClick={handleLogout}
        className="flex items-center space-x-4 p-3 m-3 rounded-lg cursor-pointer bg-red-500/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 transition"
      >
        <LogOut size={20} />
        {expanded && <span className="text-sm font-medium">Logout</span>}
      </div>
    </div>
  );
}

export default Sidebar;