import {
  Badge,
  Button,
  FileInput, // eslint-disable-line
  Flex,
  Group,
  Image,
  Modal,
  Select, // eslint-disable-line
  Table,
  TextInput, // eslint-disable-line
} from "@mantine/core";
import React, { useEffect } from "react";
import { useForm } from "@mantine/form";// eslint-disable-line
import axios from "axios";
import API_ENPOINTS from "../../API";
import { IconEdit, IconTrashX } from "@tabler/icons-react";

interface Product {
  sku: string;
  productName: string;
  category: string;
  intQty: number;
  cost: number;
  price: number;
  image?: string;
}

interface Category {
  id: number; // Assuming categories have an ID
  Category: string;
  status: number;
  // Add other properties if needed
}

const Sales: React.FC = () => {
  const [viewDelete, setViewDelete] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null); // eslint-disable-line
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null); // eslint-disable-line

  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [productCategories, setProductCategories] = React.useState<string[]>( // eslint-disable-line
    []
  );
  const [productTblRows, setProductTblRows] = React.useState<JSX.Element[]>([]);
  const [Sales, setSales] = React.useState<Product[]>([]);

  const loadSales = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_Sales);
      console.log(response.data);
      if (Array.isArray(response.data)) {
        setSales(response.data); // Assuming the response contains an array of Sales
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error loading Sales:", error);
    }
  };

  const loadProductCategories = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCT_CATEGORIES);
      console.log(response.data);
      if (Array.isArray(response.data)) {
        const categoriesList = response.data.map(
          (category: Category) => category.Category
        );
        console.log("categoriesList");
        console.log(categoriesList);
        setProductCategories(categoriesList);
      } else if (
        response.data.categories &&
        Array.isArray(response.data.categories)
      ) {
        const categoriesList = response.data.categories.map(
          (category: Category) => category.Category
        );
        console.log(categoriesList);
        setProductCategories(categoriesList);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error loading product categories:", error);
    }
  };

  useEffect(() => {
    loadProductCategories();
    loadSales();
  }, []);

  useEffect(() => {
    const rows = Sales.map((product) => (
      <Table.Tr key={product.sku} style={{ border: "1px solid #dee2e6" }}>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.sku}
        </Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.productName}
        </Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.image ? (
            <Image
              radius="md"
              h={50}
              w="auto"
              fit="contain"
              src={product.image}
              style={{ border: "1px solid #dee2e6" }}
            />
          ) : (
            <Badge color="gray">No Image</Badge>
          )}
        </Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "10px" }}>
          {product.category}
        </Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>
          {product.intQty}
        </Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>
          ${product.cost.toFixed(2)}
        </Table.Td>
        <Table.Td style={{ textAlign: "right", padding: "10px" }}>
          ${product.price.toFixed(2)}
        </Table.Td>
        <Table.Td
          style={{
            display: "flex",
            gap: "5px",
            justifyContent: "end",
            padding: "10px",
          }}
        >
          <Button onClick={() => handleEditViewModal(product)}>
            <IconEdit />
          </Button>
          <Button color="red" onClick={() => hadleDeleteConfirm(product)}>
            <IconTrashX />
          </Button>
        </Table.Td>
      </Table.Tr>
    ));

    setProductTblRows(rows);
  }, [Sales]);

  const headers = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "left" }}>DATE</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>INVOICE</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>CUSTOMER</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>EMAIL</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Quantity</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Cost Price</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Selling Price</Table.Th>
      <Table.Th></Table.Th>
    </Table.Tr>
  );

  const hadleDeleteConfirm = async (product: Product) => {
    setViewDelete(true);
    setSelectedProduct(product);
  };

  const handleDeleteProceed = async () => {
    try {
      await axios.delete(`${API_ENPOINTS.DELETE_PRODUCT}`, {
        params: {
          product: selectedProduct,
        },
      });
      setViewDelete(false);
      loadSales();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Modal
        opened={viewDelete}
        onClose={() => setViewDelete(false)}
        title="Delete product"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <p>Are you sure you want to delete this product?</p>
        <Group justify="flex-end" mt="md">
          <Button onClick={() => setViewDelete(false)} color="gray">
            Close
          </Button>
          <Button onClick={handleDeleteProceed} color="red">
            Delete
          </Button>
        </Group>
      </Modal>

      <Flex justify="space-between" align="center">
        <h4>Sales</h4>
      </Flex>
      <Table striped highlightOnHover>
        <Table.Thead>{headers}</Table.Thead>
        <Table.Tbody>{productTblRows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default Sales;
