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
  const [productAutocompleteList, setProductAutocompleteList] = React.useState<any>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>({});
  const [productCost, setProductCost] = React.useState<any>(0);
  const [productQuantity, setProductQuantity] = React.useState<any>(0);
  const [receiptRows, setReceiptRows] = React.useState<any>([]);
  const [reciptEntries, setReciptEntries] = React.useState<any>([]);
  const [viewAddItem, setViewAddItem] = React.useState<any>([]);
  const [totalCost, setTotalCost] = React.useState<Number>(0);
  const [isPosted, setIsPosted] = React.useState(false);
  const [selectedProducts, setSelectedProducts] = React.useState<any[]>([]);
  const [productCounter, setProductCounter] = React.useState<number>(1);
  const [purchaseOrdersDetails, setPurchaseOrdersDeatils] = React.useState<any[]>([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = React.useState<any>(null);
  const [viewDetailsModal, setViewDetailsModal] = React.useState(false);
  const [productName, setProductName] = React.useState<string>("");
  const [sku, setSKU] = React.useState<string>("");

  const rows = purchaseOrders.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td style={{ textAlign: "left" }}>{product.purchaseOrderCode}</Table.Td>
      <Table.Td style={{ textAlign: "left" }}>{product.SupplierCode}</Table.Td>
      <Table.Td style={{ textAlign: "left" }}>{product.SupplierName}</Table.Td>
      <Table.Td style={{ textAlign: "left" }}>{product.docDate}</Table.Td>
      <Table.Td style={{ textAlign: "left" }}>LKR {product.TotalCost.toFixed(2)}</Table.Td>
      <Table.Td style={{ display: "flex", justifyContent: "end", gap: "5px" }}>
        <Button 
          color="teal" 
          onClick={() => {
            handlePurchesOrderDetailsView(product); 
          }}
        >
          <IconEye />
        </Button>
        <Button color="red"
        onClick={() => handleRemovePurchaseOrder(product.purchaseOrderCode)} 
        >
          
          <IconTrashX />
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  const headers = (
    <Table.Tr>
      <Table.Th style={{ textAlign: "left" }}>PURCHASE ORDER</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>SUPPLIER CODE</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>SUPPLIER NAME</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>DATE</Table.Th>
      <Table.Th style={{ textAlign: "left" }}>TOTAL COST</Table.Th>
      <Table.Th style={{ textAlign: "left" }}></Table.Th>
    </Table.Tr>
  );

  // const handleRemovePurchaseOrder = async (poCode: string) => {
  //   try {
  //     // Make a DELETE request to remove the purchase order
  //     await axios.post(`${API_ENPOINTS.DELETE_PURCHASE_ORDER}`, { param: poCode } )
      
  //     // Reload purchase orders after deletion
  //     loadPurchaseOrders();
      
  //     console.log('Purchase order removed successfully');
  //   } catch (error) {
  //     console.log('Error removing purchase order:', error);
  //   }
  // };

  
  const handleRemovePurchaseOrder = async(poCode: string) => {
    try {
      const response = await axios.post(API_ENPOINTS.DELETE_PURCHASE_ORDER ,{
        poCode: poCode
      });

      loadPurchaseOrders();
    } catch (error) {
      console.log(error)
    }
}

  const loadSuppliers = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_SUPPLIERS);
      setSuppliersDataSet(response.data);
      const spl = response.data.map((element: any) => ({
        value: element.id + "",
        label: element.name,
      }));
      setSupplierList(spl);
    } catch (error) {
      console.log(error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      const products = response.data;
      setProductsDataSet(products);
      const spl = products.map((element: any) => element.sku);
      setProductAutocompleteList(spl);
    } catch (error) {
      console.log(error);
    }
  };

 

  const handleSupplierSelect = (value: string) => {
    const suppId = value;
    const selectedSupplier = suppliersDataSet.find((element: any) => {
      return element.id === parseInt(suppId);
    });
    setSelectedSupplier(selectedSupplier);
  };

  const handleProductSelect = (value: string) => {
    const seletedProduct = productsDataSet.find((element: any) => {
      return element.sku === value;
    });
    
    setSelectedProduct(seletedProduct);
    setSKU(seletedProduct.sku);
    setProductName(seletedProduct.productName);  
    setProductCost(seletedProduct.cost);
    
  };

  const handleAddProductToReciept = () => {
    if (selectedProduct && productQuantity > 0) {
      const newEntry = {
        ...selectedProduct,
        po_id: productCounter,
        quantity: productQuantity,
        cost: productCost,
      };
      setProductCounter((prevCounter) => prevCounter + 1);
      setReciptEntries((prevEntries: any) => [...prevEntries, newEntry]);
      setTotalCost((prevTotalCost: any) => Number(prevTotalCost) + Number(productCost) * Number(productQuantity));
      setSelectedProduct({});
      setProductCost(0);
      setProductQuantity(0);
    }
    else{
      alert(`Product or Product Quantitiy Empty`);
    }
  };

  const handleRemoveProductfromReciept = (productsToRemove: any[]) => {
    const updatedEntries = reciptEntries.filter(
      (entry: any) => !productsToRemove.some((product) => product.sku === entry.sku)
    );
    const newTotalCost = updatedEntries.reduce(
      (total: number, item: any) => total + item.quantity * item.cost,
      0
    );
  
    setReciptEntries(updatedEntries);
    setTotalCost(newTotalCost);
    // setReciptEntries('');
  };

  const handlePrintPurchaseOrder = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });

      const supplierName = selectedSupplier.name || "Unknown Supplier";
      const receiptDate = new Date().toLocaleDateString();
      const receiptItems = reciptEntries || [];
      const totalCost = receiptItems.reduce(
        (total, item) => total + item.quantity * item.cost,
        0
      );

      doc.setFontSize(16);
      doc.text('Purchase Order Receipt', 70, 20);
      doc.setFontSize(12);
      doc.text(`Supplier: ${supplierName}`, 20, 40);
      doc.text(`Date: ${receiptDate}`, 20, 50);
      doc.text('Product', 20, 70);
      doc.text('Qty', 90, 70);
      doc.text('Cost', 120, 70);
      doc.line(20, 72, 180, 72); 

      let startY = 80;
      receiptItems.forEach((item, index) => {
        doc.text(item.productName || 'Unknown', 20, startY + (index * 10));
        doc.text(String(item.quantity), 90, startY + (index * 10));
        doc.text(`$${item.cost}`, 120, startY + (index * 10));
      });

      doc.setFontSize(14);
      doc.text(`Total: $${totalCost.toFixed(2)}`, 120, startY + (receiptItems.length * 10) + 10);
      doc.save('purchase_order_receipt.pdf'); 

      console.log('Receipt printed successfully');
    } catch (error) {
      console.log('Error generating receipt:', error);
    }
  };

  const handleSavePurchaseOrder = async () => {
    try {
      const response = await axios.post(API_ENPOINTS.CREATE_PURCHASE_ORDER, {
        supplier: selectedSupplier,
        orderDetails: reciptEntries,
        totalCost: totalCost,
      });
      setIsPosted(true);
      loadPurchaseOrders();
      
    } catch (error) {
      console.log(error);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PURCHASE_ORDERS);
      setPurchaseOrders(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadPurchaseOrderDetails = async (poCode: string) => {
    try {
      const response = await axios.get(`${API_ENPOINTS.GET_PURCHASE_ORDERS_DETAILS}`, { params: { poCode } })
      setPurchaseOrdersDeatils(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePurchesOrderDetailsView = (order: any) => {
    loadPurchaseOrderDetails(order.purchaseOrderCode);
    setViewDetailsModal(true);
  };

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadProducts();
  }, []);


  return (
    <div>
      <Flex justify="space-between">
        <h4>Purchase Orders</h4>
        <Button onClick={() => setViewAddItem('add')} color="teal">
          <IconSquareRoundedPlus />
        </Button>
      </Flex>

      <Modal
        opened={viewAddItem === 'add'}
        title={viewAddItem === 'add' ? "New Purchase Order" : "Add New Purchase Order "}
        size="100%"
        radius={0}
        onClose={() => {
          setViewAddItem(false);  
          setReceiptRows([]);
          setReciptEntries([]);          
          setSelectedSupplier([]); 
          setTotalCost(0);    
        }
        }
      >
        <Flex direction="column" gap="md">
          <Select
            label="Select Supplier"
            data={supplierList}
            onChange={handleSupplierSelect}
          />
         
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
  <tbody>
    <tr>
      <td><Text>Supplier Code:</Text></td>
      <td><Text style={{ fontWeight: "bold" }}>{selectedSupplier.code}</Text></td>
      <td><Text>Supplier Name:</Text></td>
      <td><Text style={{ fontWeight: "bold" }}>{selectedSupplier.name}</Text></td>
      <td><Text>Email:</Text></td>
      <td><Text style={{ fontWeight: "bold" }}>{selectedSupplier.email}</Text></td>
      <td><Text>Phone:</Text></td>
      <td><Text style={{ fontWeight: "bold" }}>{selectedSupplier.phone}</Text></td>
      <td><Text>Address:</Text></td>
      <td>
        <Text style={{ fontWeight: "bold" }}>{selectedSupplier.address},</Text>
        <Text style={{ fontWeight: "bold" }}>{selectedSupplier.city},</Text>
        <Text style={{ fontWeight: "bold" }}>{selectedSupplier.country}.</Text>
      </td>
    </tr>
  </tbody>
</table>
        

          <Autocomplete
            label="Select Product"
            data={productAutocompleteList}
            onChange={handleProductSelect}
          />
           <TextInput
            label="Product"
            type="text"
            value={productName}
            readOnly
          />
          <TextInput
            label="Quantity"
            type="number"
            value={productQuantity}
            onChange={(event) => setProductQuantity(Number(event.currentTarget.value))}
          />
           <TextInput
            label="Cost"
            type="number"
            value={productCost}
            onChange={(event) => setProductCost(Number(event.currentTarget.value))}
          />
          <Button onClick={handleAddProductToReciept}>Add Product</Button>
          <Table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
              reciptEntries.map((entry: any, index: number) => (
                <tr key={index}>
                  <td>{entry.sku}</td>
                  <td>{entry.productName}</td>
                  <td>{entry.quantity}</td>
                  <td>${entry.cost}</td>
                  <td>
                    <Button color="red" onClick={() => handleRemoveProductfromReciept([entry])}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Text>Total Cost: ${totalCost.toFixed(2)}</Text>
          <Button color="green"  onClick={handleSavePurchaseOrder}>Save Order</Button>
          <Button onClick={handlePrintPurchaseOrder}>Print Receipt</Button>
          <Button color="red" onClick={() =>{
          setViewAddItem(false);  
          setReceiptRows([]);
          setReciptEntries([]);          
          setSelectedSupplier([]); 
          setTotalCost(0);    
        }
        }>
            Cancel
          </Button>
        </Flex>
      </Modal>

      <Modal
        opened={viewDetailsModal}
        title="Purchase Order Details"
        onClose={() => setViewDetailsModal(false)}
      >
        {/* Details of the purchase order can be displayed here */}
        <Table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Cost</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrdersDetails.map((detail, index) => (
              <tr key={index}>
                <td>{detail.poCode}</td>
                <td>{detail.ProductCode}</td>
                <td>{detail.ProductName}</td>
                <td>${detail.cost}</td>
                <td>{detail.qty}</td>
              </tr>
              
            ))}
          </tbody>
          <tfoot>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th>Tolat Cost:</th>
                <th>${purchaseOrdersDetails.reduce((sum, detail) => sum + (detail.cost * detail.qty), 0).toFixed(2)}</th>
                </tr>
          </tfoot>
        </Table>
        
      </Modal>

      <Table striped highlightOnHover>
      <Table.Thead>{headers}</Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
};

export default PurchaseOrders;