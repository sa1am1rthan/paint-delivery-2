import React from "react";
import { Typography, List, ListItem, ListItemPrefix } from "@material-tailwind/react";
import {
  PowerIcon,
  DocumentPlusIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

interface SidebarProps {
  handleLogout: () => void;
  handleAddCsvClick: () => void;
  role: { role: string } | null;
  state: string;
}

const Sidebar: React.FC<SidebarProps> = ({ handleLogout, handleAddCsvClick, role, state}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHistoryClick = () => {
    router.push('/history');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  console.log("role >>> ", role && role.role);
  console.log("state >>> ", state);

  const getDashboardTitle = () => {
    if (role && role.role) {
      switch (role.role) {
        case 'admin':
          return 'Admin Dashboard';
        case 'driver':
          return 'Driver Dashboard';
        case 'owner':
          return 'Owner Dashboard';
        default:
          return 'Dashboard';
      }
    }
    return 'Dashboard';
  };

  const handleManageUsersClick = () => {
    router.push('/users-list');
  };

  return (
    <div className="h-[calc(100vh-2rem)] w-full max-w-[15rem] p-4 shadow-xl shadow-blue-gray-900/5">
      <div className="mb-2 p-4">
        <Typography variant="h5" color="blue-gray">
          {getDashboardTitle()}
        </Typography>
      </div>
      <List>
      {(((role && role.role) !== 'driver') || (state !== 'driver')) && 
        (<ListItem onClick={handleAddCsvClick}>
            <ListItemPrefix>
              <DocumentPlusIcon className="h-5 w-5" />
            </ListItemPrefix>
            Upload CSV
          </ListItem>
        )}
        <ListItem onClick={handleHistoryClick}>
          <ListItemPrefix>
            <ClockIcon className="h-5 w-5" />
          </ListItemPrefix>
          History
        </ListItem>
        {role && role.role === "owner" && (
          <ListItem onClick={handleManageUsersClick}>
            <ListItemPrefix>
              <UserIcon className="h-5 w-5" />
            </ListItemPrefix>
            Manage Users
          </ListItem>
        )}
        <ListItem onClick={handleLogout}>
          <ListItemPrefix>
            <PowerIcon className="h-5 w-5" />
          </ListItemPrefix>
          Log Out
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;
