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
import axios from "axios";
import API_ENPOINTS from "../../API";
import '@mantine/dates/styles.css';

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
  const [postDate, setPostDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [sku, setSKU] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [customerDataSet, setCustomerDataSet] = useState<any>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAddToCart = () => {
    if (selectedProduct) {
      setCart((prev) => [...prev, { ...selectedProduct, quantity, discount }]);
      setQuantity(1);
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

  const handleConfirmCheckout = () => {
    alert("Checkout confirmed. Your order summary is displayed in the modal.");
    setCheckoutModalOpen(false);
  };

  const handleProductSelect = (sku: string) => {
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setSelectedProduct(product);
      setProductName(product.name);
      setSKU(product.sku);
    }
  };

  const handleCustomerSelect = (contact: string) => {
    const customer = customerDataSet.find((c) => c.contact === contact);
    if (customer) {
      setSelectedCustomer(customer);
      setCustomerName(customer.name);
      setContactNumber(customer.contact);
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
      setCustomerDataSet(customer);
    } catch (error) {
      console.log(error);
    }
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
                <TextInput value={customerName} placeholder="Customer Name" readOnly />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Contact Number</Text>
                <Autocomplete
                  data={customerDataSet.map((customer: Customer) => customer.contact)}
                  value={contactNumber}
                  onChange={(val) => {
                    setContactNumber(val);
                    handleCustomerSelect(val);
                  }}
                  placeholder="Contact Number"
                />
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
        <Grid.Col span={12}>
          <Card padding="lg" shadow="sm">
            <Grid>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Post Date</Text>
                <DateInput value={postDate} onChange={setPostDate} placeholder="Select date" />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Due Date</Text>
                <DateInput value={dueDate} onChange={setDueDate} placeholder="Select date" />
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
                    <NumberInput value={quantity} onChange={(val) => setQuantity(val || 1)} min={1} />
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
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.discount}%</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 1)).toFixed(2)}</td>
                    <td>
                      <Button color="red" onClick={() => handleRemoveFromCart(index)}>Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Button mt="md" fullWidth color="blue" onClick={handleCheckout}>Checkout</Button>
          </Card>
        </Grid.Col>
      </Grid>

      <Modal opened={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} title="Order Summary">
        <Table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Discount</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.discount}%</td>
                <td>${(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 1)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Text size="lg" mt="md">Total: ${cartTotal}</Text>
        <Button fullWidth mt="md" color="green" onClick={handleConfirmCheckout}>Confirm Checkout</Button>
      </Modal>
    </Container>
  );
};

export default POS1;
