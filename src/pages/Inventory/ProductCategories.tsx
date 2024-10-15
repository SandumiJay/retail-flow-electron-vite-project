import {
  Badge,
  Button,
  Flex,
  Group,
  Modal,
  Table,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import React, { useEffect } from "react";
import API_ENPOINTS from "../../API";
import axios from "axios";
import "./Products.css";
import {
  IconEdit,
  IconSquareRoundedPlus,
  IconTrashX,
} from "@tabler/icons-react";

interface ProductCategory {
  id: string;
  Category: string;
  Status: number;
}

const ProductCategories: React.FC = () => {
  const [viewAddItem, setViewAddItem] = React.useState(false);
  const [viewEditItem, setViewEditItem] = React.useState(false);
  const [viewDelete, setViewDelete] = React.useState(false);
  const [selectedProductCategoryId, setSelectedProductCategoryId] =
    React.useState("");

  const [productCategoryList, setProductCategoryList] = React.useState<
    ProductCategory[]
  >([]);

  const loadProductCategories = async () => {
    try {
      const response = await axios.get<{
        message: string;
        categories: ProductCategory[];
      }>(API_ENPOINTS.GET_PRODUCT_CATEGORIES);
      console.log(response.data);
      setProductCategoryList(response.data.categories); // TypeScript now knows `response.data` is `ProductCategory[]`
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteConfirm = (product: ProductCategory) => {
    setSelectedProductCategoryId(product.id);
    setViewDelete(true);
  };

  const hanldeDeleteProceed = async () => {
    try {
      await axios.delete(API_ENPOINTS.DELETE_PRODUCT_CATEGORY, {
        params: {
          id: selectedProductCategoryId,
        },
      });
      setViewDelete(false);
      loadProductCategories();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    loadProductCategories();
  }, []);
  const rows = productCategoryList.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td style={{ width: "10%", textAlign: "center" }}>
        {product.id}
      </Table.Td>
      <Table.Td style={{ width: "40%", textAlign: "center" }}>
        {product.Category}
      </Table.Td>
      <Table.Td style={{ width: "40%", textAlign: "center" }}>
        {product.Status == 1 ? (
          <Badge color="blue">Active</Badge>
        ) : (
          <Badge color="red">Inactive</Badge>
        )}
      </Table.Td>
      <Table.Td
        style={{ display: "flex", gap: "5px", justifyContent: "flex-end" }}
      >
        <Button onClick={() => handleEditProductCategory(product.id)}>
          <IconEdit />
        </Button>
        <Button color="red" onClick={() => handleDeleteConfirm(product)}>
          {" "}
          <IconTrashX />
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  const headers = (
    <Table.Tr>
      <Table.Th style={{ width: "10%", textAlign: "center" }}>ID</Table.Th>
      <Table.Th style={{ width: "40%", textAlign: "center" }}>
        Product Category
      </Table.Th>
      <Table.Th style={{ width: "40%", textAlign: "left" }}> Status</Table.Th>

      <Table.Th></Table.Th>
    </Table.Tr>
  );
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      category: "",
    },

    validate: {
      category: (value) =>
        /^[a-z]+([A-Z][a-z]*)*$/.test(value) ? null : "Invalid Category Name",
    },
  });
  const handleProductCategoryUpdate = async (values: { category: string }) => {
    const { category } = values;
    console.log(values);
    console.log(category);
    try {
      await axios.put(API_ENPOINTS.UPDATE_PRODUCT_CATEGORY, {
        id: selectedProductCategoryId,
        category: category,
      });
      form.reset();
      setViewEditItem(false);
      loadProductCategories();
    } catch (error) {
      console.log(error);
    }
  };
  const handleProductCategorySave = async (values: { category: string }) => {
    const { category } = values;
    console.log(values);
    console.log(category);
    try {
      await axios.post(API_ENPOINTS.CREATE_PRODUCT_CATEGORY, {
        category: category,
      });
      form.reset();
      setViewAddItem(false);
      loadProductCategories();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditProductCategory = (id: string) => {
    setSelectedProductCategoryId(id);
    const product = productCategoryList.find((product) => product.id === id);
    form.setValues({
      category: product?.Category,
    });
    setViewEditItem(true);
  };
  return (
    <>
      <Modal
        opened={viewDelete}
        onClose={() => setViewDelete(false)}
        title="Delete Product Category"
        size="lg"
      >
        <p>Ate you sure you want to delete this product category?</p>

        <Group justify="flex-start" mt="md">
          {" "}
          <Button type="submit" color="red" onClick={hanldeDeleteProceed}>
            Delete
          </Button>
          <Button onClick={() => setViewDelete(false)} color="gray">
            Close
          </Button>{" "}
        </Group>
      </Modal>
      <Modal
        opened={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="Add new Product Category"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleProductCategorySave)}>
          <TextInput
            withAsterisk
            label="Category Name"
            placeholder="Electronics"
            key={form.key("category")}
            {...form.getInputProps("category")}
          />

          <Group justify="flex-start" mt="md">
            {" "}
            <Button type="submit" color="green">
              Create
            </Button>
            <Button onClick={() => setViewAddItem(false)} color="gray">
              Close
            </Button>{" "}
          </Group>
        </form>
      </Modal>
      <Modal
        opened={viewEditItem}
        onClose={() => setViewEditItem(false)}
        title="Edit Product Category"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleProductCategoryUpdate)}>
          <TextInput
            withAsterisk
            label="Category Name"
            placeholder="Electronics"
            key={form.key("category")}
            {...form.getInputProps("category")}
          />

          <Group justify="flex-start" mt="md">
            {" "}
            <Button type="submit" color="green">
              Update
            </Button>
            <Button onClick={() => setViewEditItem(false)} color="gray">
              Close
            </Button>{" "}
          </Group>
        </form>
      </Modal>
      <div>
        <Flex justify="space-between" align="center">
          <h4>Product Categories</h4>
          <Button onClick={() => setViewAddItem(true)} color="green">
            <IconSquareRoundedPlus />
          </Button>
        </Flex>
        <div>
          <Table
            captionSide="top"
            striped
            highlightOnHover
            withTableBorder
            // withColumnBorders
            className="table-striped-data"
          >
            <Table.Thead>{headers}</Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default ProductCategories;
