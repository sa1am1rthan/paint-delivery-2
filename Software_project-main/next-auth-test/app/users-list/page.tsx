'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoggedHeader from "../LoggedHeader";
import Footer from "../Footer";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card, Typography, Button } from "@material-tailwind/react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function UsersList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "owner") {
      router.push("/unauthorized");
    } else {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newRole }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleBackClick = () => {
    router.push('/owner-dashboard');
  };

  const handleLogout = async () => {
    await fetch('/api/logout');
    router.push('/');
  };

  const roleBodyTemplate = (rowData: User) => {
    return (
      <select
        value={rowData.role}
        onChange={(e) => updateUserRole(rowData._id, e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="pending">Pending</option>
        <option value="admin">Admin</option>
        <option value="driver">Driver</option>
      </select>
    );
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <LoggedHeader handleLogout={handleLogout} />
      <div className="min-h-[calc(100vh-140px)] p-4" style={{marginTop:"70px"}}>
        <div className="mb-4">
        <Button
                        color="blue"
                        className="px-4 py-2 text-sm font-bold text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-300 shadow-md"
                        onClick={handleBackClick}
                    >
                        <div style={{display:"flex"}}>
                        <svg style={{width:"20px", marginRight:"10px"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                        </svg>
                        <div>Back</div>
                        </div>
                    </Button>
        </div>
        <Card className="h-full w-full overflow-scroll">
          <Typography variant="h4" color="blue-gray" className="p-4 text-center">
            Users List
          </Typography>
          <DataTable value={users} paginator rows={10} dataKey="_id" 
                     emptyMessage="No users found" className="p-datatable-sm">
            <Column field="name" header="Name" sortable></Column>
            <Column field="email" header="Email" sortable></Column>
            <Column field="role" header="Role" body={roleBodyTemplate} sortable></Column>
          </DataTable>
        </Card>
      </div>
      <Footer />
    </>
  );
}
