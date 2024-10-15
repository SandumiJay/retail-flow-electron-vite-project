import {
  Button,
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
}

const POS1: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [productsDataSet, setProductsDataSet] = useState<any>([]);
  const [productAutocompleteList, setProductAutocompleteList] = useState<any>(
    []
  );
  const [invoiceItemsList, setInvoiceItemsList] = useState<any>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Date | null>(null);
  const handleAddToCart = () => {
    if (selectedProduct) {
      setCart((prev) => [...prev, { ...selectedProduct, quantity,discount}]);
      setQuantity(1);
      setSelectedProduct(null);
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
    // Implement checkout logic here
    alert("Checkout process initiated");
    setCheckoutModalOpen(false);
  };

  const cartTotal = cart
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);

  const printPage = () => {
    window.print();
  };
  const loadProducts = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
      console.log(response.data);
      if (Array.isArray(response.data)) {
        setProducts(response.data); // Assuming the response contains an array of products
        setProductsDataSet(products);

        // Map through products to create the autocomplete list
        const spl = products.map((element: any) => {
          return element.productName; // Assuming 'name' is the label you want to display
        });

        // Set the product autocomplete list
        setProductAutocompleteList(spl);
      } else {
        console.error("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };
  useEffect(() => {
    loadProducts();
  }, []);
  return (
    <Container fluid>
       
      <Grid>
        <Grid.Col span={8} style={{backgroundColor:"lightseagreen"}}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Group>
              <Text size="lg">Post Date</Text>
              <DateInput
                value={value}
                onChange={setValue}
                placeholder="Date input"
              />
            </Group>
            <Group>
              <Text size="lg">Due Date</Text>
              <DateInput
                value={value}
                onChange={setValue}
                placeholder="Date input"
              />
            </Group>
          </div>
        </Grid.Col>
        <Grid.Col span={8} style={{backgroundColor:"lightblue"}}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text size="lg">Product :</Text>
                <Select
                  placeholder="Choose a product"
                  value={selectedProduct ? selectedProduct.name : ""}
                  onChange={(val) => {
                    const product = products.find((p) => p.name === val);
                    setSelectedProduct(product || null);
                  }}
                  data={productAutocompleteList}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text size="lg">Qty :</Text>
                <NumberInput
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  min={1}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text size="lg">Discount</Text>
                <NumberInput
                  value={discount}
                  onChange={(val) => setDiscount(val || 1)}
                />
              </div>

              <Button onClick={handleAddToCart}>Add</Button>
            </div>
          </Card>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Product</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Discount</Table.Th>
                <Table.Th>Price</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cart.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>{item.discount}</Table.Td>
                  <Table.Td>${(item.price * item.quantity).toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Grid.Col>

        <Grid.Col span={4} style={{backgroundColor:"lightgrey"}}>
          <Card>
            <Text size="lg">Cart Summary</Text>
            {cart.length === 0 && <Text>No items in cart</Text>}
            <Stack>
              {cart.map((item, index) => (
                <Group key={index}>
                  <Text>
                    {item.name} x{item.quantity}
                  </Text>
                  <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => handleRemoveFromCart(index)}
                  >
                    Remove
                  </Button>
                </Group>
              ))}
              <Group>
                <Text>Total</Text>
                <Text>${cartTotal}</Text>
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
        title="Confirm Checkout"
      >
        <Text>Are you sure you want to proceed with the checkout?</Text>
        <Button onClick={handleConfirmCheckout} fullWidth mt="md">
          Confirm
        </Button>
      </Modal>
    </Container>
  );
};

export default POS1;
