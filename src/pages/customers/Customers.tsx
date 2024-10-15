import {
  Button,
  Flex,
  Group,
  Modal,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import {
  IconEdit,
  IconSquareRoundedPlus,
  IconTrashX,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import axios from "axios";
import API_ENPOINTS from "../../API";
import { countries } from "../../staticData/Countries";

interface Customer {
  id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  status: number;
}

const Customers: React.FC = () => {
  const [viewAddItem, setViewAddItem] = useState<boolean>(false);
  const [viewEditItem, setViewEditItem] = useState<{
    open: boolean;
    customer?: Customer;
  }>({ open: false });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const form = useForm({
    initialValues: {
      id: "",
      name: "",
      email: "",
      contact: "",
      address: "",
      city: "",
      country: "Sri Lanka",
      status: 0,
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_CUSTOMERS);
      setCustomers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCustomerAdd = async () => {
    try {
      await axios.post(API_ENPOINTS.ADD_CUSTOMER, form.values);
      form.reset();
      setViewAddItem(false);
      loadCustomers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCustomerEdit = async () => {
    try {
      const { id, ...updateData } = form.values;
      await axios.put(`${API_ENPOINTS.UPDATE_CUSTOMER}/${id}`, updateData);
      setViewEditItem({ open: false });
      loadCustomers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCustomerDelete = async (id: string) => {
    try {
      await axios.delete(`${API_ENPOINTS.DELETE_CUSTOMER}/${id}`);
      loadCustomers();
    } catch (error) {
      console.log(error);
    }
  };

  const rows = customers.map((customer) => (
    <tr key={customer.id}>
      <td>{customer.id}</td>
      <td>{customer.name}</td>
      <td>{customer.email}</td>
      <td>{customer.contact}</td>
      <td>{customer.address}</td>
      <td>{customer.city}</td>
      <td>{customer.country}</td> 
      <td style={{ display: "flex", gap: "5px", justifyContent: "end" }}>
        <Button
          onClick={() => {
            form.setValues(customer);
            setViewEditItem({ open: true, customer });
          }}
        >
          <IconEdit />
        </Button>
        <Button color="red" onClick={() => handleCustomerDelete(customer.id)}>
          <IconTrashX />
        </Button>
      </td>
    </tr>
  ));

  const headers = (
    <tr>
      <th>ID</th>
      <th>Customer Name</th>
      <th>Email</th>
      <th>Contact</th>
      <th>Address</th>
      <th>City</th>
      <th>Country</th>
      <th></th>
    </tr>
  );

  return (
    <div>
      {/* Add Customer Modal */}
      <Modal
        opened={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="Add New Customer"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleCustomerAdd)}>
          <Group>
            <TextInput
              withAsterisk
              label="Customer Code"
              placeholder="CS00001"
              {...form.getInputProps("code")}
            />
            <TextInput
              withAsterisk
              label="Customer Name"
              placeholder="Customer Name"
              {...form.getInputProps("name")}
            />
            <TextInput
              withAsterisk
              label="Email"
              placeholder="Email"
              type="email"
              {...form.getInputProps("email")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Contact"
              placeholder="Contact Number"
              {...form.getInputProps("contact")}
            />
            <TextInput
              withAsterisk
              label="Address"
              placeholder="Address"
              {...form.getInputProps("address")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="City"
              placeholder="City"
              {...form.getInputProps("city")}
            />
            <Select
              label="Country"
              placeholder="Select Country"
              data={countries}
              {...form.getInputProps("country")}
            />
          </Group>

          <Group justify="flex-start" mt="md">
            <Button type="submit" color="green">
              Add
            </Button>
            <Button onClick={() => setViewAddItem(false)} color="red">
              Close
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        opened={viewEditItem.open}
        onClose={() => setViewEditItem({ open: false })}
        title="Edit Customer"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleCustomerEdit)}>
          <Group>
            <TextInput
              withAsterisk
              label="Customer Name"
              placeholder="Customer Name"
              {...form.getInputProps("name")}
            />
            <TextInput
              withAsterisk
              label="Email"
              placeholder="Email"
              type="email"
              {...form.getInputProps("email")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Contact"
              placeholder="Contact Number"
              {...form.getInputProps("contact")}
            />
            <TextInput
              withAsterisk
              label="Address"
              placeholder="Address"
              {...form.getInputProps("address")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="City"
              placeholder="City"
              {...form.getInputProps("city")}
            />
            <Select
              label="Country"
              placeholder="Select Country"
              data={countries}
              {...form.getInputProps("country")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Status"
              placeholder="Status"
              type="number"
              {...form.getInputProps("status")}
            />
          </Group>
          <Group justify="flex-start" mt="md">
            <Button type="submit" color="green">
              Save Changes
            </Button>
            <Button
              onClick={() => setViewEditItem({ open: false })}
              color="red"
            >
              Close
            </Button>
          </Group>
        </form>
      </Modal>

      <div>
        <Flex justify="space-between" align="center">
          <h4>Customers</h4>
          <Button onClick={() => setViewAddItem(true)} color="green">
            <IconSquareRoundedPlus /> New Customer
          </Button>
        </Flex>
      </div>
      <div>
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
    </div>
  );
};

export default Customers;
