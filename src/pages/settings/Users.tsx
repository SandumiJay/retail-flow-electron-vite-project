import {
  Button,
  Flex,
  Group,
  Modal,
  Select,
  Switch,
  Table,
  TextInput,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import axios from "axios";
import API_ENDPOINTS from "../../API";
import ROLE_PERMISSIONS from "../../permission";


interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: number; // 1 = Active, 0 = Inactive
}



const Users: React.FC = () => {
  const [viewModal, setViewModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [userState,setUserState] =useState(false);
  const [userRole,setUserRole]=useState();

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user", // default role
    },
    validate: {
      username: (value) => (value ? null : "Username is required"),
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email format",
      password: (value) =>
        editUser || value ? null : "Password is required",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  const getTheUserRole = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_USER_ROLE);
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Failed to load users:", error.response?.data || error.message);
    }
  };
  
  const hasPermission = (
    feature: keyof typeof ROLE_PERMISSIONS['user'],
    role: keyof typeof ROLE_PERMISSIONS
  ) => ROLE_PERMISSIONS[role]?.[feature];

const loadUsers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_USERS);
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to load users:", error.response?.data || error.message);
    }
  };

  const handleSaveUser = async (values: typeof form.values) => {
    const { username, email, password, role } = values;

    try {
      if (editUser) {
        // Update existing user
        await axios.put(`${API_ENDPOINTS.UPDATE_USER}/${editUser.id}`, {
          username,
          email,
          password: password || undefined, // Only send password if updated
          role,
        });
      } else {
        // Create new user
        await axios.post(API_ENDPOINTS.CREATE_USER, {
          username,
          email,
          password,
          role,
        });
      }

      form.reset();
      setViewModal(false);
      setEditUser(null);
      loadUsers();
    } catch (error) {
      console.error("Error saving user:", error.response?.data || error.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    form.setValues({
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
    });
    setViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API_ENDPOINTS.DELETE_USER}/${id}`);
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error.response?.data || error.message);
    }
  };

  const handleToggleStatus = async (user: User) => {
    console.log(user)
    try {
      if(userState){
        setUserState(!userState)
      }
      else{
        setUserState(true)
      }
    
      const res= await axios.put(`${API_ENDPOINTS.UPDATE_USER_STATUS}/${user.id}`, {
        status: userState ? 0 : 1, // Toggle status
      });
      console.log(res.status)
      loadUsers(); // Refresh users after status update
      console.log(user)
    } catch (error) {
      console.error("Failed to update status:", error.response?.data || error.message);
    }
  };

  const rows = users.map((user) => (
    <tr key={user.id}>
      <td>{user.id}</td>
      <td>{user.username}</td>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>
          
      <Switch 
      checked={userState} 
      onChange={() => handleToggleStatus(user)}
      label={userState === true ? "Active" : "Inactive"}
      style={{ width: "45%" , marginRight: "5%", marginTop: "4%" }}
      step="0.01"
    />
      </td>
      <td style={{ display: "flex", gap: "5px" }}>
        <Button onClick={() => handleEdit(user)}>Edit</Button>
        <Button color="red" onClick={() => handleDelete(user.id)}>
          Delete
        </Button>
      </td>
    </tr>
  ));

  useEffect(() => {
    loadUsers();
    getTheUserRole();
  }, []);

  return (
    <div>
      <Modal
        opened={viewModal}
        onClose={() => {
          setViewModal(false);
          setEditUser(null);
          form.reset();
        }}
        title={editUser ? "Edit User" : "Add User"}
        size="auto"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleSaveUser)}>
          <Group>
            <TextInput
              withAsterisk
              label="Username"
              placeholder="Enter username"
              {...form.getInputProps("username")}
            />
            <TextInput
              withAsterisk
              label="Email"
              placeholder="Enter email"
              {...form.getInputProps("email")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk={!editUser}
              label="Password"
              placeholder="Enter password"
              type="password"
              {...form.getInputProps("password")}
            />
            <TextInput
              withAsterisk={!editUser}
              label="Confirm Password"
              placeholder="Confirm password"
              type="password"
              {...form.getInputProps("confirmPassword")}
            />
          </Group>
          <Group>
            <Select
              withAsterisk
              label="Role"
              placeholder="Select role"
              data={[
                { value: "admin", label: "Admin" },
                { value: "super admin", label: "Super Admin" },
                { value: "user", label: "User" },
              ]}
              {...form.getInputProps("role")}
            />
          </Group>
          <Group justify="flex-end" mt="md">
            <Button onClick={() => setViewModal(false)}>Close</Button>
            <Button type="submit">{editUser ? "Update" : "Add"}</Button>
          </Group>
        </form>
      </Modal>
      <Flex justify="space-between" align="center" mb="md">
        <h4>Users</h4>
        <Button onClick={() => setViewModal(true)}>Add User</Button>
      </Flex>
      <Table
        captionSide="top"
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
      >
        <thead>
          <tr>
            <th>User Id</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

export default Users;