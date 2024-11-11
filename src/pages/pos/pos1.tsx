import {
  Button,
  Autocomplete,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { DateInput } from "@mantine/dates";
import axios, { AxiosResponse } from "axios";
import API_ENPOINTS from "../../API";
import '@mantine/dates/styles.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import emailjs from 'emailjs-com';


interface Product {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  discount?: number;
  sku?: string;
}

interface Customer {
  code: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  status: number;
}

const POS1: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsDataSet, setProductsDataSet] = useState<any>([]);
  const [productAutocompleteList, setProductAutocompleteList] = useState<any>([]);
  const [invoiceItemsList, setInvoiceItemsList] = useState<any>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Date | null>(null);
  const [postDate, setPostDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [sku, setSKU] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [customerDataSet, setcustomerDataSet] = useState<any>([]);
  const [customerName, setcustomerName] = useState<any>([]);
  const [contactNumber, setcontactNumber] = useState<any>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>(""); 
  const [maxQty, setMaxQty] = useState<number>(0);


  const handleAddToCart = () => {
    if (selectedProduct) {
      setCart((prev) => [...prev, { ...selectedProduct, quantity, discount }]);
      setQuantity(0);
      setSelectedProduct(null);
      setProductName("");
      setSKU("");
      setDiscount(0);
    } else {
      alert("Please select a product.");
    }
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    setCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    let response: AxiosResponse<any, any>;
    try {
      console.log(cart);
      const updatePayload = cart.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));
  
      console.log(updatePayload);
      response = await axios.put(API_ENPOINTS.UPDATE_INVENTORY, { products: updatePayload });
  
      alert("Checkout confirmed. Inventory updated successfully.");
      setCart([]);
      setCheckoutModalOpen(false);
      setcontactNumber("");
      setcustomerName("");
    } catch (error) {
      console.error("Error response:", error.response.data.message);
      alert("Failed to update inventory. Please try again." +  error.response.data.message);
    }
  };

  const handleProductSelect = (sku: string) => {
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setSelectedProduct(product);
      setProductName(product.productName);
      setSKU(product.sku);
    }
  };
  const handleCustomerSelect = (contact: string) => {
    const customer = customerDataSet.find((p) => p.contact === contact);
    if (customer) {
      setSelectedCustomer(customer);
      setcustomerName(customer.name);
      setcontactNumber(customer.contact);
    }
  };

  const handleDiscountChange = (val: number | undefined) => {
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setMaxDiscount(product.maxDiscount);
      if (val !== undefined) {
        if (val > maxDiscount) {
          alert(`Discount cannot exceed ${maxDiscount}%`);
          setDiscount(maxDiscount);
        } else {
          setDiscount(val);
        }
      } else {
        setDiscount(0);
      }
    }
  };

  const handleQtyChange = (val: number | undefined) => {
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setMaxQty(product.intQty);
      if (val !== undefined) {
        if (val > maxQty) {
          alert(`Quantity cannot exceed ${maxQty}`);
          setQuantity(0);
        } else {
          setQuantity(val);
        }
      } else {
        setQuantity(0);
      }
    }
  };

  const calculateDiscountedPrice = (price: number, discount: number): number => {
    return price - (price * (discount / 100));
  };

  const cartTotal = cart
    .reduce((acc, item) => acc + calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 1), 0)
    .toFixed(2);

  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      const products = response.data;
      setProductsDataSet(products);
      const SKU = products.map((element: any) => element.sku);
      setProductAutocompleteList(SKU);
    } catch (error) {
      console.log(error);
    }
  };

  const loadCustomer = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_CUSTOMERS);
      const customer = response.data;
      setcustomerDataSet(customer);
    } catch (error) {
      console.log(error);
    }
  };
  const generatePDF = () => {
    const doc = new jsPDF();

  
    doc.text("", 14, 18);
    doc.autoTable({
      head: [['Product', 'Quantity', 'Discount', 'Total Price']],
      body: cart.map((item) => [
        item.productName,
        item.quantity,
        item.discount ? `${item.discount}%` : '0%',
        `$${(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 1)).toFixed(2)}`,
      ]),
    });

    doc.text(`Total: $${cartTotal}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save("order_summary.pdf");
  };
  const sendEmail = (event: React.FormEvent) => {
    event.preventDefault();

    const templateParams = {
      to_name: customerName,
      from_name: "Your Business Name",
      message: `Thank you for your order! Here is your order summary: Total: $${cartTotal}`,
      email: customerEmail,
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
        alert("Email sent successfully!");
      }, (error) => {
        console.log('Failed to send email:', error);
        alert("Failed to send email.");
      });
  };


  useEffect(() => {
    loadProducts();
    loadCustomer();
  }, []);

  return (
    <Container fluid>
      
      <Grid>

      <Grid.Col span={12}>
          <Card padding="lg" shadow="sm">
            <Grid>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Customer Name</Text>
                <TextInput value={customerName} placeholder="Customer Name" readOnly/>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Contact Number</Text>
                <Autocomplete
                  data={customerDataSet.map((customer: Customer) => customer.contact)}
                  value={contactNumber}
                  onChange={(val) => {
                    setcontactNumber(val);
                    handleCustomerSelect(val);
                  }}
                  placeholder="Contact Number"
                />              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
        <Grid.Col span={12}>
          <Card padding="lg" shadow="sm">
            <Grid>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Post Date</Text>
                <DateInput value={value} onChange={setValue} placeholder="Select date" />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Due Date</Text>
                <DateInput value={value} onChange={setValue} placeholder="Select date" />
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

        <Grid.Col span={8}>
          <Card padding="lg" shadow="sm">
            <Stack spacing="sm">
              <Grid>
                <Group>
                  <Grid.Col span={3}>
                    <Text size="lg" weight={500}>SKU:</Text>
                    <Autocomplete
                      data={productAutocompleteList}
                      value={sku}
                      onChange={(val) => {
                        setSKU(val);
                        handleProductSelect(val);
                      }}
                      placeholder="Select SKU"
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Text size="lg" weight={500}>Product Name:</Text>
                    <TextInput value={productName} readOnly />
                  </Grid.Col>
                  <Grid.Col span={2}>
                      <Text size="lg" weight={500}>Qty:</Text>
                      <NumberInput 
                        value={quantity} 
                        onChange={(val) => {
                          handleQtyChange(val);
                          setQuantity(val);
                          
                        }} 
                        min={0} 
                        max={maxQty}
                       />
                    </Grid.Col>
                  <Grid.Col span={2}>
                    <Text size="lg" weight={500}>Discount:</Text>
                    <NumberInput
                      value={discount}
                      onChange={handleDiscountChange}
                      min={0}
                      max={maxDiscount}
                    />
                  </Grid.Col>
                </Group>
              </Grid>
              <Button color="green" onClick={handleAddToCart}>Add to Cart</Button>
            </Stack>

            <Table mt="md">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Discount</th>
                  <th>Price</th>
                  <th>Discounted Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={index}>
                    <td>{item.sku}</td>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.discount}%</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 1)).toFixed(2)}</td>
                    <td>
                      <Button
                        variant="light"
                        color="red"
                        onClick={() => handleRemoveFromCart(index)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card padding="lg" shadow="sm">
            <Text size="lg" weight={500}>Cart Summary</Text>
            {cart.length === 0 && <Text>No items in cart</Text>}
            <Stack spacing="xs">
              <Group position="apart">
                <Text weight={500}>Total:</Text>
                <Text weight={500}>${cartTotal}</Text>
              </Group>
            </Stack>
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={setPaymentMethod}
              data={[
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "online", label: "Online" },
              ]}
              mt="md"
            />
            <Button onClick={handleCheckout} fullWidth mt="md">
              Checkout
            </Button>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal
        opened={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="RetailFlow"
      >
        <Stack spacing="xs">
         
          <h3>Cart Summary</h3>
          <Group>
          <Text><strong>Customer:</strong> {customerName}</Text>
          <Text><strong>Contact:</strong> {contactNumber}</Text>
          </Group>
          <Table mt="sm">
            <Table.Thead striped highlightOnHover>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Unit Price (Rs.)</Table.Th>
                <Table.Th>Discount</Table.Th>
                <Table.Th>Total (Rs.)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cart.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{item.productName}</Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>{item.price.toFixed(2)}</Table.Td>
                  <Table.Td>{item.discount}%</Table.Td>
                  <Table.Td>{(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 1)).toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Table>
  <tbody>
    <tr>
      <td><strong>Subtotal:</strong></td>
      <td style={{ textAlign: 'right' }}>Rs. {cartTotal}</td>
    </tr>
    <tr>
      <td><strong>Discount:</strong></td>
      <td style={{ textAlign: 'right' }}>Rs. {discount}</td>
    </tr>
    <tr>
      <td><strong>Net Total:</strong></td>
      <td style={{ textAlign: 'right' }}>Rs. {cartTotal}</td>
    </tr>
    <tr>
      <td><strong>Payment Method:</strong></td>
      <td style={{ textAlign: 'right' }}>{paymentMethod}</td>
    </tr>
  </tbody>
</Table>

          <Text mt="sm"><strong>Payment Instructions:</strong> Please draw the cheque in favor of Anuradha Transport Services.</Text>
          
          <Button color="green" fullWidth mt="md" onClick={handleConfirmCheckout}>
            Confirm Checkout
          </Button>
          <Button mt="md" fullWidth color="blue" onClick={generatePDF}>Print PDF</Button>
          <Button mt="md" fullWidth color="teal" onClick={sendEmail}>Send Email</Button>
     
        </Stack>
      </Modal>
    </Container>
  );
};

export default POS1;
