import {
  Button,
  Flex,
  Group,
  Modal,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import React, { useEffect } from "react";
import { useForm } from "@mantine/form";
import axios from "axios";
import API_ENPOINTS from "../../API";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: number;
}

const Users: React.FC = () => {
  const [viewAddItem, setViewAddItem] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user", // default role
    },
    validate: {
      username: (value) => (value ? null : "Username is required"),
      email: (value) => (value ? null : "Email is required"),
      password: (value) =>
        value ? null : "Password is required",
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const loadUsers = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_USERS);
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddUser = async (values: typeof form.values) => {
    const { username, email, password, role } = values;

    try {
      // Create user
      await axios.post(API_ENPOINTS.ADD_USER, {
        username,
        email,
        password,
        role,
      });

      // Reset form and close modal
      form.reset();
      setViewAddItem(false);
      // Optionally, reload Users list
      loadUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const rows = users.map((user) => (
    <tr key={user.id}>
      <td>{user.id}</td>
      <td>{user.username}</td>
      <td>{user.email}</td>
      <td>{user.role}</td> {/* Display user role */}
      <td>{user.status === 1 ? "Active" : "Inactive"}</td>
      <td style={{ display: "flex", gap: "5px" }}>
        <Button>Edit</Button>
        <Button color="red">Delete</Button>
      </td>
    </tr>
  ));

  const headers = (
    <tr>
      <th>User Id</th>
      <th>User Name</th>
      <th>Email</th>
      <th>Role</th>
      <th>Status</th>
      <th></th>
    </tr>
  );

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <Modal
        opened={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="Add new user account"
        size="auto"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleAddUser)}>
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
              withAsterisk
              label="Password"
              placeholder="Enter password"
              type="password"
              {...form.getInputProps("password")}
            />
            <TextInput
              withAsterisk
              label="Confirm Password"
              placeholder="Confirm password"
              type="password"
              {...form.getInputProps("confirmPassword")}
            />
          </Group>

          {/* Role Selection */}
          <Group>
            <Select
              withAsterisk
              label="Role"
              placeholder="Select role"
              data={[
                { value: "admin", label: "Admin" },
                { value: "editor", label: "Editor" },
                { value: "viewer", label: "Viewer" },
                { value: "user", label: "User" }, // Default user role
              ]}
              {...form.getInputProps("role")}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button onClick={() => setViewAddItem(false)}>Close</Button>
            <Button type="submit">Add</Button>
          </Group>
        </form>
      </Modal>

      <Flex justify="space-between" align="center">
        <h4>Users</h4>
        <Button onClick={() => setViewAddItem(true)}>Add User</Button>
      </Flex>
      <Table
        captionSide="top"
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
      >
        <thead>{headers}</thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

export default Users;