import React from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = ({ key }: { key: string }) => {
    navigate(`/${key}`);
  };

  // Obtener usuario del localStorage
  const storedUser = localStorage.getItem('authUser');
  let userRole = '';
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      userRole = user.role?.name || '';
    } catch {
      userRole = '';
    }
  }

  const isAdmin = userRole === 'admin';

  return (
    <Sider breakpoint="lg" collapsedWidth="0" style={{ left: 0 }}>
      <div style={{ height: 64, margin: 16, color: 'white', fontSize: 18 }}>
        🏥 Dashboard
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultOpenKeys={['medical', 'users']}
        onClick={handleClick}
      >
        <Menu.SubMenu key="medical" icon={<MedicineBoxOutlined />} title="Medical">
          <Menu.Item key="patientList">Pacientes</Menu.Item>
          <Menu.Item key="appointmentList">Citas</Menu.Item>
          <Menu.Item key="manageAppointmentList">Gestión de Citas</Menu.Item>
          <Menu.Item key="resultados-med">Recetas</Menu.Item>
        </Menu.SubMenu>

        <Menu.SubMenu key="laboratory" icon={<ExperimentOutlined />} title="Laboratory">
          <Menu.Item key="resultados-lab">Resultados</Menu.Item>
        </Menu.SubMenu>

        {isAdmin && (
          <Menu.SubMenu key="users" icon={<UserOutlined />} title="Usuarios">
            <Menu.Item key="all-users">Gestión</Menu.Item>
            <Menu.Item key="roles">Roles</Menu.Item>
          </Menu.SubMenu>
        )}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
