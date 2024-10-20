import {
  Badge,
  Button,
  FileInput,
  Flex,
  Group,
  Image,
  Modal,
  Select,
  Table,
  TextInput,
} from "@mantine/core";
import React, { useEffect } from "react";
import { useForm } from "@mantine/form";
import axios from "axios";
import API_ENPOINTS from "../../API";
import {
  IconEdit,
  IconEditCircle,
  IconSquareRoundedPlus,
  IconTrashX,
} from "@tabler/icons-react";

interface Product {
  id: number;
  sku: string;
  productName: string;
  category: string;
  intQty: number;
  cost: number;
  price: number;
  image?: string;
}

interface Category {
  id: number;
  Category: string;
  status: number;
}

const Products: React.FC = () => {
  const [viewAddItem, setViewAddItem] = React.useState(false);
  const [viewEditItem, setViewEditItem] = React.useState(false);
  const [viewDelete, setViewDelete] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [productCategories, setProductCategories] = React.useState<string[]>([]);
  const [productTblRows, setProductTblRows] = React.useState<JSX.Element[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      console.log(response.data);
      if (Array.isArray(response.data)) {
        setProducts(response.data); // Assuming the response contains an array of products
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadProductCategories = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCT_CATEGORIES);
  
      // Ensure response is valid and contains the expected structure
      if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
        const categoriesList = response.data.data.map((category: Category) => category.Category);
        setProductCategories(categoriesList);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error: any) {
      console.error("Error loading product categories:", error.message || error);
    }
  };
  

  const hasImageChanged = () => {
    return selectedFile !== null || imagePreview !== originalImage;
  };

  const form = useForm({
    initialValues: {
      procode: "",
      proname: "",
      category: "",
      quantity: 0,
      price: 0,
      cost: 0,
    },
    validate: {
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

  const handleUpdateProduct = async (values: typeof form.values) => {
    const { procode, proname, category, quantity, price, cost } = values;
    let imageUrl = originalImage;

    try {
      if (hasImageChanged() && selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadResponse = await axios.post(
          API_ENPOINTS.UPLOAD_PRODUCT_IMAGE,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        imageUrl = uploadResponse.data.url;
      }

      await axios.put(API_ENPOINTS.UPDATE_PRODUCT, {
        sku: procode,
        name: proname,
        category,
        quantity,
        price,
        cost,
        image: imageUrl,
      });

      form.reset();
      setViewEditItem(false);
      setImagePreview(null);
      loadProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProduct = async (values: typeof form.values) => {
    const { procode, proname, category, quantity, price, cost } = values;
    let imageUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        const uploadResponse = await axios.post(
          API_ENPOINTS.UPLOAD_PRODUCT_IMAGE,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        imageUrl = uploadResponse.data.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    }

    try {
      await axios.post(API_ENPOINTS.ADD_PRODUCT, {
        sku: procode,
        name: proname,
        category,
        quantity,
        price,
        cost,
        image: imageUrl || "",
      });

      form.reset();
      setViewAddItem(false);
      setImagePreview(null);
      setSelectedFile(null);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEditViewModal = (product: Product) => {
    setViewEditItem(true);
    setEditingProduct(product);
    setOriginalImage(product.image || null);
    form.setValues({
      procode: product.sku,
      proname: product.productName,
      category: product.category,
      quantity: product.intQty,
      cost: product.cost,
      price: product.price,
    });
    setImagePreview(product.image || null);
  };

  const hadleDeleteConfirm = async (product: Product) => {
    setViewDelete(true);
    setSelectedProduct(product);
  };

  useEffect(() => {
    console.log("Products state updated:", products); 
    const rows = products.map((product) => (
      <tr key={product.sku} style={{ border: "1px solid #dee2e6" }}>
        <td style={{ textAlign: "left", padding: "10px" }}>{product.sku}</td>
        <td style={{ textAlign: "left", padding: "10px" }}>{product.productName}</td>
        <td style={{ textAlign: "left", padding: "10px" }}>
          {product.image ? (
            <Image radius="md" height={50} fit="contain" src={product.image} style={{ border: "1px solid #dee2e6" }} />
          ) : (
            <Badge color="gray">No Image</Badge>
          )}
        </td>
        <td style={{ textAlign: "left", padding: "10px" }}>{product.category}</td>
        <td style={{ textAlign: "right", padding: "10px" }}>{product.intQty}</td>
        <td style={{ textAlign: "right", padding: "10px" }}>${product.cost.toFixed(2)}</td>
        <td style={{ textAlign: "right", padding: "10px" }}>${product.price.toFixed(2)}</td>
        <td style={{ display: "flex", gap: "5px", justifyContent: "end", padding: "10px" }}>
          <Button onClick={() => handleEditViewModal(product)}><IconEdit /></Button>
          <Button color="red" onClick={() => hadleDeleteConfirm(product)}><IconTrashX /></Button>
        </td>
      </tr>
    ));

    setProductTblRows(rows);
  }, [products]);

  useEffect(() => {
    loadProductCategories();
    loadProducts();
  }, []);

  const headers = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "left" }}>SKU</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Product Name</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Product Image</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>Category</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Quantity</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Cost Price</Table.Th>
      <Table.Th style={{ textAlign: "right" }}>Selling Price</Table.Th>
      <Table.Th></Table.Th>
    </Table.Tr>
  );


  const handleDeleteProceed = async () => {
    try {
      await axios.delete(`${API_ENPOINTS.DELETE_PRODUCT}`, {
        data: { id: selectedProduct?.id }  // Send the product ID in the request body
      });
      setViewDelete(false);
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
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
          <Button onClick={() => setViewAddItem(false)} color="gray">
            Close
          </Button>
          <Button onClick={handleDeleteProceed} color="red">
            Delete
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="Add new product"
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleAddProduct)}>
          <Group>
            <TextInput
              style={{ width: "100%" }}
              withAsterisk
              label="Product Name"
              placeholder="Product Name"
              {...form.getInputProps("proname")}
            />
          </Group>
          <Group>
            <Select
              label="Category"
              placeholder="Pick value"
              data={productCategories}
              {...form.getInputProps("category")}
            />
            <TextInput
              withAsterisk
              label="Quantity"
              placeholder="Quantity"
              type="number"
              {...form.getInputProps("quantity")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Cost"
              placeholder="Cost"
              type="number"
              step="0.01"
              {...form.getInputProps("cost")}
            />
            <TextInput
              withAsterisk
              label="Price"
              placeholder="Price"
              type="number"
              step="0.01"
              {...form.getInputProps("price")}
            />
            <TextInput
              withAsterisk
              label="Max Discount"
              placeholder="Price"
              type="number"
              step="0.01"
              {...form.getInputProps("price")}
            />
          </Group>
          <FileInput
            variant="filled"
            size="md"
            radius="lg"
            label="Product Image"
            description="Upload .jpg or .png image"
            placeholder="No file selected"
            onChange={handleFileChange}
          />
          {imagePreview && (
            <Image
              radius="md"
              className="image-preview"
              src={imagePreview}
              alt="Image preview"
              height={300}
              width={300}
              style={{ marginTop: "1rem" }}
            />
          )}
          <Group justify="flex-start" mt="md">
            <Button type="submit" color="green">
              Add
            </Button>
            <Button onClick={() => setViewAddItem(false)} color="gray">
              Close
            </Button>
          </Group>
        </form>
      </Modal>
      <Modal
        opened={viewEditItem}
        onClose={() => setViewEditItem(false)}
        title={
          <Group>
            <IconEditCircle size={20} />
            <span className="modal-header-text">Edit Product</span>
          </Group>
        }
        size="lg"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <form onSubmit={form.onSubmit(handleUpdateProduct)}>
          <Group>
            <TextInput
              withAsterisk
              label="Product Code"
              placeholder="SKU00001"
              {...form.getInputProps("procode")}
              readOnly
            />
            <TextInput
              style={{ width: "100%" }}
              withAsterisk
              label="Product Name"
              placeholder="Product Name"
              {...form.getInputProps("proname")}
            />
          </Group>
          <Group>
            <Select
              label="Category"
              placeholder="Pick value"
              data={productCategories}
              {...form.getInputProps("category")}
            />
            <TextInput
              withAsterisk
              label="Quantity"
              placeholder="Quantity"
              type="number"
              {...form.getInputProps("quantity")}
            />
          </Group>
          <Group>
            <TextInput
              withAsterisk
              label="Cost"
              placeholder="Cost"
              type="number"
              step="0.01"
              {...form.getInputProps("cost")}
            />
            <TextInput
              withAsterisk
              label="Price"
              placeholder="Price"
              type="number"
              step="0.01"
              {...form.getInputProps("price")}
            />
          </Group>
          <FileInput
            variant="filled"
            size="md"
            radius="lg"
            label="Product Image"
            description="Upload .jpg or .png image"
            placeholder="No file selected"
            onChange={handleFileChange}
          />
          {imagePreview && (
            <Image
              radius="md"
              src={imagePreview}
              alt="Image preview"
              height={100}
              width={100}
              style={{ marginTop: "1rem" }}
            />
          )}
          <Group justify="flex-start" mt="md">
            <Button type="submit" color="green">
              Update
            </Button>
            <Button onClick={() => setViewEditItem(false)} color="red">
              Close
            </Button>
          </Group>
        </form>
      </Modal>
      {/* <Notification icon={<CheckIcon />} color="teal" title="All good!" mt="md">
        Everything is fine
      </Notification> */}
      <Flex justify="space-between" align="center">
        <h4>Products</h4>
        <Button onClick={() => setViewAddItem(true)} color="green">
          Add New Product 
        </Button>
      </Flex>
      <Table striped highlightOnHover>
        <Table.Thead>{headers}</Table.Thead>
        <Table.Tbody>{productTblRows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default Products;