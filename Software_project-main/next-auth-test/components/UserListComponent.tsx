'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoggedHeader from "../app/LoggedHeader";
import Footer from "../app/Footer";
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
            onClick={handleBackClick}
            className="mt-4 flex items-center gap-2 px-6 py-3 font-sans text-xs font-bold text-center text-white uppercase align-middle transition-all rounded-lg select-none hover:bg-blue-gray-900/10 active:bg-blue-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          >
            Back
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
