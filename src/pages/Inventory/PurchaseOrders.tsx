import {
  Autocomplete,
  Button,
  Flex,
  Group,
  Input,
  Modal,
  Select,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconEdit,
  IconEye,
  IconSquareRoundedPlus,
  IconTrashX,
} from "@tabler/icons-react";
import React, { useEffect } from "react";
import API_ENPOINTS from "../../API";
import axios from "axios";
import jsPDF from 'jspdf';
interface Product {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  cost: number;
}

const sampleProducts: Product[] = [
  {
    sku: "P001",
    name: "Product 1",
    category: "Electronics",
    quantity: 100,
    cost: 299.99,
  },
  {
    sku: "P002",
    name: "Product 2",
    category: "Apparel",
    quantity: 250,
    cost: 49.99,
  },
  {
    sku: "P003",
    name: "Product 3",
    category: "Books",
    quantity: 150,
    cost: 19.99,
  },
  {
    sku: "P004",
    name: "Product 4",
    category: "Furniture",
    quantity: 50,
    cost: 499.99,
  },
];

const PurchaseOrders: React.FC = () => {

  const [purchaseOrders, setPurchaseOrders] = React.useState<any>([]);
  const [supplierList, setSupplierList] = React.useState<string[]>([]);
  const [suppliersDataSet, setSuppliersDataSet] = React.useState<any>([]);
  const [selectedSupplier, setSelectedSupplier] = React.useState<any>({});
  const [productsDataSet, setProductsDataSet] = React.useState<any>([]);
  const [productAutocompleteList, setProductAutocompleteList] =
    React.useState<any>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>({});
  const [productCost, setProductCost] = React.useState<any>(0);
  const [productQuantity, setProductQuantity] = React.useState<any>(0);
  const [receiptRows, setReceiptRows] = React.useState<any>([]);
  const [reciptEntries, setReciptEntries] = React.useState<any>([]);
  const [viewAddItem, setViewAddItem] = React.useState(false);
  const [totalCost, setTotalCost] = React.useState<any>(0);
  const [isPosted, setIsPosted] = React.useState(false);
  const rows = purchaseOrders.map((product) => (
    <tr key={product.id}>
      <td>{product.purchaseOrderCode}</td>
      <td>{product.SupplierCode}</td>
      <td>{product.SupplierName}</td>
      <td>{product.docDate}</td>
      <td>${product.TotalCost.toFixed(2)}</td>
      <td style={{ display: "flex", justifyContent: "end", gap: "5px" }}>
        <Button color="teal">
          <IconEye />
        </Button>
        {/* <Button>
          <IconEdit />
        </Button> */}
        <Button color="red">
          {" "}
          <IconTrashX />
        </Button>
      </td>
    </tr>
  ));

  const headers = (
    <tr>
      <th>PURCHASE ORDER</th>
      <th>SUPPLIER CODE</th>
      <th>SUPPLIER NAME</th>
      <th>DATE</th>
      <th>TOTAL COST</th>
      <th></th>
    </tr>
  );
  const loadSuppliers = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_SUPPLIERS);
      console.log(response.data);
      setSuppliersDataSet(response.data);
      const spl = response.data.map((element: any) => {
        return {
          value: element.id + "", // Assuming 'id' is the unique identifier
          label: element.name, // Assuming 'name' is the label you want to display
        };
      });
      setSupplierList(spl);
      console.log(spl);
    } catch (error) {
      console.log(error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      const products = response.data;

      // Assuming response.data is an array of products
      setProductsDataSet(products);

      // Map through products to create the autocomplete list
      const spl = products.map((element: any) => {
        return element.productName; // Assuming 'name' is the label you want to display
      });

      // Set the product autocomplete list
      setProductAutocompleteList(spl);
      console.log(spl);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSupplierSelect = (value: string) => {
    console.log(value);
    const suppId = value;
    const selectedSupplier = suppliersDataSet.find((element: any) => {
      return element.id === parseInt(suppId);
    });
    setSelectedSupplier(selectedSupplier);
    console.log(selectedSupplier);
  };

  const handleProductSelect = (value: string) => {
    console.log(value);
    const seletedProduct = productsDataSet.find((element: any) => {
      return element.productName === value;
    });
    console.log(seletedProduct);
    setSelectedProduct(seletedProduct);
    setProductCost(seletedProduct.cost);
  };

  const handleAddProductToReciept = () => {
    if (selectedProduct && productQuantity > 0) {
      const newEntry = {
        ...selectedProduct,
        quantity: productQuantity,
        cost: productCost,
      };
      setReciptEntries((prevEntries: any) => [...prevEntries, newEntry]);
      setTotalCost((prevTotalCost: any) => prevTotalCost + productCost);
      console.log(reciptEntries);
      // Reset input fields
      setSelectedProduct({});
      setProductCost(0);
      setProductQuantity(1);
    }
  };
const handlePrintPurchaseOrder = async () => {
  try {
    try {
      const doc = new jsPDF({
        orientation: 'portrait', // Could also be 'landscape'
        unit: 'mm',
        format: 'a5', // A5 format for the receipt
      });
  
      // Define receipt content
      const supplierName = selectedSupplier.name || "Unknown Supplier";
      const receiptDate = new Date().toLocaleDateString();
      const receiptItems = reciptEntries || [];
      const totalCost = receiptItems.reduce(
        (total, item) => total + item.quantity * item.cost,
        0
      );
  
      // Adding title to the PDF
      doc.setFontSize(16);
      doc.text('Purchase Order Receipt', 70, 20); // Centered on the A5 page
  
      // Adding Supplier information
      doc.setFontSize(12);
      doc.text(`Supplier: ${supplierName}`, 20, 40);
      doc.text(`Date: ${receiptDate}`, 20, 50);
  
      // Table headers
      doc.text('Product', 20, 70);
      doc.text('Qty', 90, 70);
      doc.text('Cost', 120, 70);
      doc.line(20, 72, 180, 72); // Draw a line under headers
  
      // Adding receipt items to the PDF
      let startY = 80;
      receiptItems.forEach((item, index) => {
        doc.text(item.productName || 'Unknown', 20, startY + (index * 10));
        doc.text(String(item.quantity), 90, startY + (index * 10));
        doc.text(`$${item.cost}`, 120, startY + (index * 10));
      });
  
      // Total cost
      doc.setFontSize(14);
      doc.text(`Total: $${totalCost.toFixed(2)}`, 120, startY + (receiptItems.length * 10) + 10);
  
      // Save and print the PDF
      doc.save('purchase_order_receipt.pdf'); // Automatically downloads the PDF
  
      console.log('Receipt printed successfully');
    } catch (error) {
      console.log('Error generating receipt:', error);
    }
  } catch (error) {
    console.log(error);
  }
}
  const handleSavePurchaseOrder = async () => {
    try {
      const response = await axios.post(API_ENPOINTS.CREATE_PURCHASE_ORDER, {
        supplier: selectedSupplier,
        orderDetails: reciptEntries,
        totalCost: totalCost,
      })
      setIsPosted(true);
      loadPurchaseOrders();
    } catch (error) {
      console.log(error);
    }
  }

  const loadPurchaseOrders = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PURCHASE_ORDERS);
      setPurchaseOrders(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadProducts();
  }, []);

  return (
    <div>
      <Modal
        opened={viewAddItem}
        onClose={() => setViewAddItem(false)}
        title="New Purchase Order"
        size="100%"
        radius={0}
        transitionProps={{ transition: "fade", duration: 200 }}
      >
        <Group>
          <Select
            label="Supplier"
            placeholder="Select Supplier"
            data={supplierList}
            //   {...form.getInputProps("category")}
            onChange={handleSupplierSelect}
          />
          {/* <TextInput
            style={{ width: "100%" }}
            withAsterisk
            label="Product Name"
            placeholder="Product Name"
            //   {...form.getInputProps("proname")}
          /> */}
        </Group>
        <Group style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: 5 }}>
            <Text>Supplier Code:</Text>
            <Text style={{ fontWeight: "bold" }}>{selectedSupplier.code}</Text>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <Text>Supplier Name:</Text>
            <Text style={{ fontWeight: "bold" }}>{selectedSupplier.name}</Text>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <Text>Email:</Text>
            <Text style={{ fontWeight: "bold" }}>{selectedSupplier.email}</Text>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <Text>Phone:</Text>
            <Text style={{ fontWeight: "bold" }}>{selectedSupplier.phone}</Text>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <Text>Address:</Text>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {" "}
              <Text style={{ fontWeight: "bold" }}>
                {selectedSupplier.address},
              </Text>
              <Text style={{ fontWeight: "bold" }}>
                {selectedSupplier.city},
              </Text>
              <Text style={{ fontWeight: "bold" }}>
                {selectedSupplier.country}.
              </Text>
            </div>
          </div>
        </Group>
        <Group
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <label>Product:</label>
            <Autocomplete
              placeholder="Add Products"
              data={productAutocompleteList}
              onChange={handleProductSelect}
            />
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <label>Qty:</label>
            <Input
              type="number"
              placeholder="1"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <label>Cost:</label>
            <Input
              type="number"
              placeholder="1"
              value={productCost}
              onChange={(e) => setProductCost(e.target.value)}
            />
          </div>
          <Button onClick={handleAddProductToReciept}>Add</Button>
        </Group>
        <Group>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Product Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Cost</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reciptEntries.map((entry: any, index: number) => (
                <Table.Tr key={index}>
                  <Table.Td>{entry.sku}</Table.Td>
                  <Table.Td>{entry.productName}</Table.Td>
                  <Table.Td>{entry.category}</Table.Td>
                  <Table.Td>{entry.quantity}</Table.Td>
                  <Table.Td>{entry.cost}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Th></Table.Th>
                <Table.Th></Table.Th>
                <Table.Th></Table.Th>
                <Table.Th>Total:</Table.Th>
                <Table.Th>${totalCost}</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Group>
        <Group>
          {isPosted ? (
            <Button color="teal" onClick={handlePrintPurchaseOrder}>Print Receipt</Button>
          ): (
            <Button color="green" onClick={handleSavePurchaseOrder}>Save</Button>
          )}
          <Button color="red" onClick={() => setViewAddItem(false)}>
            Cancel
          </Button>
        </Group>
      </Modal>
      <Flex justify="space-between" align="center">
        <h4>Purchase Orders</h4>
        <Button onClick={() => setViewAddItem(true)} color="green">
          <IconSquareRoundedPlus /> New Purchase Order
        </Button>
      </Flex>

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

export default PurchaseOrders;
