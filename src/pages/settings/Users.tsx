import {
    Button,
    FileInput,
    Flex,
    Group,
    Image,
    Modal,
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
    const [imagePreview, setImagePreview] = React.useState<string | null>(null);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  
    const [users, setUsers] = React.useState<User[]>([]);
    const form = useForm({
      mode: "uncontrolled",
      initialValues: {
        procode: "",
        proname: "",
        category: "",
        quantity: 0,
        price: 0,
      },
      validate: {
        procode: (value) => (value ? null : "Product code is required"),
        proname: (value) => (value ? null : "Product name is required"),
      },
    });
  
    const handleFileChange = (file: File | null) => {
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
        setSelectedFile(null);
      }
    };
  
    const handleAddProduct = async (values: typeof form.values) => {
      const { procode, proname, category, quantity, price } = values;
  
      if (selectedFile) {
        // Create FormData to handle file upload
        const formData = new FormData();
        formData.append("image", selectedFile);
        
        try {
          // Upload the image
          const uploadResponse = await axios.post(API_ENPOINTS.UPLOAD_PRODUCT_IMAGE, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const imageUrl = uploadResponse.data.url;
  
          // Create product with image URL
          await axios.post( API_ENPOINTS.ADD_PRODUCT, {
            sku: procode,
            name: proname,
            category,
            quantity,
            price,
            image: imageUrl,
          });
  
          // Reset form and close modal
          form.reset();
          setViewAddItem(false);
          setImagePreview(null);
          setSelectedFile(null);
          // Optionally, reload Users list
          // loadUsers();
        } catch (error) {
          console.error("Error uploading file or saving product:", error);
        }
      }
    };
  
    const rows = users.map((product) => (
      <tr key={product.id}>
        <td>{product.id}</td>
        <td>{product.username}</td> 
         
        <td>{product.email}</td>
        <td>{product.role}</td>
        
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

    const loadUsers = async () => {
        try {
          const response = await axios.get(API_ENPOINTS.GET_USERS);
          setUsers(response.data.users);
        } catch (error) {
          console.log(error);
        }
      };
  
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
          <form onSubmit={form.onSubmit(handleAddProduct)}>
            <Group>
              <TextInput
                withAsterisk
                label="User Name"
                placeholder="SKU00001"
                {...form.getInputProps("procode")}
              />
              <TextInput
                withAsterisk
                label="Email"
                placeholder="Product Name"
                {...form.getInputProps("proname")}
              />
            </Group>
            <Group>
              <TextInput
                withAsterisk
                label="Password"
                placeholder="Category"
                type="password"
                {...form.getInputProps("category")}
              />
              <TextInput
                withAsterisk
                label="Confirm Password"
                placeholder="Quantity"
                type="password"
                {...form.getInputProps("quantity")}
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
          <Button onClick={() => setViewAddItem(true)}>Add</Button>
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
  