import { Drawer, NavLink } from "@mantine/core"; // eslint-disable-line
import { useDisclosure } from "@mantine/hooks";
import {
  IconBox,
  IconBuildingSkyscraper, // eslint-disable-line
  IconBusinessplan,// eslint-disable-line
  IconCashRegister,// eslint-disable-line
  IconCategory2,
  IconChevronRight,// eslint-disable-line
  IconClipboardData,
  IconCube,// eslint-disable-line
  IconDeviceDesktop,
  IconFileCertificate,// eslint-disable-line
  IconFolders,
  IconGauge,// eslint-disable-line
  IconHome2,// eslint-disable-line
  IconSettings,
  IconTxt,// eslint-disable-line
  IconUserEdit,
  IconUsers,
  IconUsersGroup,// eslint-disable-line
  IconUserSquareRounded,// eslint-disable-line
  IconUserStar,
} from "@tabler/icons-react";
import React from "react";
import { useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(true); // eslint-disable-line
  const location = useLocation();
  return (
    <div>
      <div
        style={{ backgroundColor: "#f8f9fa", width: "100%", height: "100vh" }}
      >
        {/* <NavLink
          active={location.pathname == "/dashboard"}
          href="#required-for-focus"
          label="Dashboard"
          leftSection={<IconHome2 size="1rem" stroke={1.5} />}
        /> */}
        <NavLink
          label="Inventory"
          childrenOffset={28}
          href="#required-for-focus"
          leftSection={<IconClipboardData size="1rem" stroke={1.5} />
        } 
        defaultOpened={true}
        >
          <NavLink
            label="Purchase Orders"
            href="/purchaseorders"
            active={location.pathname == "/purchaseorders"}
            leftSection={<IconFolders size="1rem" stroke={1.5} />}
          />
          {/* <NavLink
            label="Inventory"
            href="/inventory"
            active={location.pathname == "/inventory"}
            leftSection={<IconCashRegister size="1rem" stroke={1.5} />}
          /> */}
          <NavLink
            label="Products"
            active={location.pathname == "/products"}
            href="/products"
            leftSection={<IconBox size="1rem" stroke={1.5} />}
          />
          <NavLink
            label="Products Categories"
            href="/productscategories"
            active={location.pathname == "/productscategories"}
            leftSection={<IconCategory2 size="1rem" stroke={1.5} />}
          />
          <NavLink
            label="Suppliers"
            active={location.pathname == "/suppliers"}
            href="/suppliers"
            leftSection={<IconUsers size="1rem" stroke={1.5} />}
          />
        </NavLink>
        
        <NavLink
          href="/customers"
          label="Customers"
          active={location.pathname == "/customers"}
          leftSection={<IconUserStar size="1rem" stroke={1.5} />}
        />
        {/* <NavLink
          href="/sales"
          label="Sales"
          leftSection={<IconBusinessplan size="1rem" stroke={1.5} />}
        /> */}
        {/* <NavLink
          label="Reports"
          childrenOffset={28}
          href="#required-for-focus"
          leftSection={<IconClipboardData size="1rem" stroke={1.5} />}
        > */}
          {/* <NavLink
            label="Sales Report"
            href="#required-for-focus"
            leftSection={<IconCashRegister size="1rem" stroke={1.5} />}
          />
          <NavLink
            label="Inventory Report"
            href="#required-for-focus"
            leftSection={<IconBox size="1rem" stroke={1.5} />}
          />
        </NavLink> */}
        <NavLink
          label="Settings"
          childrenOffset={28}
          href="#required-for-focus"
          leftSection={<IconSettings size="1rem" stroke={1.5} />}
        >
          <NavLink
            label="Users"
            href="/users"
            leftSection={<IconUserEdit size="1rem" stroke={1.5} />}
          />
          {/* <NavLink
            label="Roles & Permissions"
            href="/permissions"
            leftSection={<IconFileCertificate size="1rem" stroke={1.5} />}
          />
          <NavLink
            label="Profile"
            href="/profile"
            leftSection={<IconUserSquareRounded size="1rem" stroke={1.5} />}
          />
           <NavLink
            label="Company Details"
            href="/company"
            leftSection={<IconBuildingSkyscraper size="1rem" stroke={1.5} />}
          />
          <NavLink
            label="Code Formats"
            href="/codeformats"
            active={location.pathname == "/codeformats"}
            leftSection={<IconTxt size="1rem" stroke={1.5} />}
          /> */}
        </NavLink>

        <NavLink
          href="/pos"
          label="POS"
          leftSection={<IconDeviceDesktop size="1rem" stroke={1.5} />}
        />
      </div>
    </div>
  );
};

export default Sidebar;
