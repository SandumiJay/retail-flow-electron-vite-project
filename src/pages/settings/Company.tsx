import { useState } from "react";
import { TextInput, Group, Button, Image } from "@mantine/core";

const Company: React.FC = () => {
  // State management for input fields with sample default values
  const [businessName, setBusinessName] = useState("ABC Corp");
  const [email, setEmail] = useState("info@abccorp.com");
  const [phone, setPhone] = useState("123-456-7890");
  const [address, setAddress] = useState("123 Main St, Suite 4, City, Country");

  // Handler for form submission (example function)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement submission logic here
    console.log("Form submitted:", { businessName, email, phone, address });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
      <Group direction="column" spacing="md" grow style={{ display: "flex", flexDirection: "column" }}>
      <Image
      radius="md"
      src="https://img.freepik.com/premium-vector/company-logo-concept_958800-82117.jpg?w=826"
    />
        <TextInput
          label="Business Name"
          placeholder="Enter your business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />
        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          type="email" // Ensure it's an email input
        />
        <TextInput
          label="Phone"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          type="tel" // Ensure it's a phone number input
        />
        <TextInput
          label="Address"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <Button type="submit" color="blue">Update</Button>
      </Group>
    </form>
  );
};

export default Company;
