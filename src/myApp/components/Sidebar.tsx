import React from "react";
import type { ReactNode } from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../auth/context/AuthContext";


const { Sider } = Layout;

type MenuItemType = {
  key: string;
  title: string;
  icon?: ReactNode;
  roles?: string[]; // Roles que pueden ver este item (undefined = todos)
  children?: MenuItemType[];
};

const menuItems: MenuItemType[] = [
  {
    key: "medical",
    title: "Medical",
    icon: <MedicineBoxOutlined />,
    roles: ["admin", "medic", "nurse","user","laboratory"],
    children: [
      { key: "patientList", title: "Pacientes", roles: ["admin", "medic", "nurse","laboratory"] },
      { key: "patientManageList", title: "Gestión de Pacientes", roles: ["admin", "medic"] },
      { key: "appointmentList", title: "Citas", roles: ["admin", "medic", "nurse","laboratory","user"] },
      { key: "manageAppointmentList", title: "Gestión de Citas", roles: ["admin","medic"] },
      { key: "medicalHistory", title: "Historias Clinicas", roles: ["admin", "medic", "nurse","user","laboratory"] },
    ],
  },
  {
    key: "laboratory",
    title: "Laboratory",
    icon: <ExperimentOutlined />,
    roles: ["admin", "laboratory","medic"],
    children: [
      { key: "lab-order-form", title: "Pedidos", roles: ["admin", "laboratory","medic"] },
      { key: "resultados-lab", title: "Resultados", roles: ["admin", "laboratory","user","medic"] },
    ],
  },
  {
    key: "users",
    title: "Usuarios",
    icon: <UserOutlined />,
    roles: ["admin"],
    children: [
      { key: "all-users", title: "Gestión", roles: ["admin"] },
      { key: "roles", title: "Roles", roles: ["admin"] },
    ],
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { hasRole, user } = useAuthContext();

  // Si quieres ocultar todo el sidebar si no hay user:
  if (!user) return null;

  const handleClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  /**
   * Devuelve true si el item es visible para el usuario actual.
   * - Si item.roles === undefined => visible para todos los usuarios autenticados.
   * - Si item.roles definido => visible si hasRole(any of item.roles)
   */
  const isItemVisible = (item: MenuItemType): boolean => {
    if (!item.roles || item.roles.length === 0) return true;
    // hasRole acepta string | string[], así que le pasamos el array
    return hasRole(item.roles);
  };

  const renderMenuItems = (items: MenuItemType[]) =>
    items
      .map((item) => {
        // Si el item tiene children, filtramos los children según permisos
        if (item.children && item.children.length > 0) {
          const visibleChildren = item.children.filter((child) => isItemVisible(child));
          // Si el padre tiene roles y el usuario no cumple, no mostrar aunque haya children visibles
          if (item.roles && !isItemVisible(item)) {
            return null;
          }
          if (visibleChildren.length === 0) {
            // Si ningún child es visible, no renderizamos el SubMenu
            return null;
          }
          return (
            <Menu.SubMenu key={item.key} icon={item.icon} title={item.title}>
              {visibleChildren.map((child) => (
                <Menu.Item key={child.key}>{child.title}</Menu.Item>
              ))}
            </Menu.SubMenu>
          );
        }

        // Item sin children: mostrar solo si está permitido
        if (!isItemVisible(item)) return null;

        return <Menu.Item key={item.key} icon={item.icon}>{item.title}</Menu.Item>;
      })
      .filter(Boolean) as ReactNode[]; // filtrar nulls

  return (
    <Sider breakpoint="lg" collapsedWidth="0" style={{ left: 0 }}>
      <div style={{ height: 64, margin: 16, color: "white", fontSize: 18 }}>
        🏥 Dashboard
      </div>
      <Menu theme="dark" mode="inline" onClick={handleClick}>
        {renderMenuItems(menuItems)}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
