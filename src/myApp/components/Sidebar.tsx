// Sidebar.tsx
import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{ height: '100vh', position: 'fixed', left: 0 }}
    >
      <div style={{ height: 64, margin: 16, color: 'white', fontSize: 18 }}>
        🏥 Mi App
      </div>
      <Menu theme="dark" mode="inline" defaultOpenKeys={['medical', 'users']}>
        <Menu.SubMenu key="medical" icon={<MedicineBoxOutlined />} title="Medical">
          <Menu.Item key="pacientes">Pacientes</Menu.Item>
          <Menu.Item key="citas">Citas</Menu.Item>
          <Menu.Item key="resultados-med">Resultados</Menu.Item>
        </Menu.SubMenu>

        <Menu.SubMenu key="laboratory" icon={<ExperimentOutlined />} title="Laboratory">
          <Menu.Item key="resultados-lab">Resultados</Menu.Item>
        </Menu.SubMenu>

        <Menu.SubMenu key="users" icon={<UserOutlined />} title="Usuarios">
          <Menu.Item key="gestion">Gestión</Menu.Item>
          <Menu.Item key="roles">Roles</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    </Sider>
  );
};

export default Sidebar;