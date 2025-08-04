import { useState } from 'react';
import { User, MapPin, Heart, Stethoscope, Phone, Plus, Edit, Trash2 } from 'lucide-react';
import AccordionSection from '../Components/AccordionSection';
import dataEcuador from '../assets/dataEcuador'; 
import Modal from '../Components/Modal';



export default function Income() {
  const [formData, setFormData] = useState({
    apellidos: '',
    nombres: '',
    fecha: '',
    edad: '',
    sexo: '',
    cedula: '',
    estadoCivil: '',
    ocupacion: '',
    instruccion: '',
    procedencia: '',
    provincia: '',
    ciudad: '',
    sectorBarrio: '',
    calle: '',
    numeroCasa: '',
    causaEmergencia: '',
    cuadroClinico: '',
    examenFisico: '',
    diagnostico: '',
    contactos: []
  });

  const [contactoForm, setContactoForm] = useState({
    nombre: '',
    apellidos:'',
    telefono: '',
    email: '',
    relacion: ''
  });

  const [editingContact, setEditingContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [openSections, setOpenSections] = useState({
    paciente: true,
    adicional: false,
    medica: false,
    contacto: false
  });

  const provincias = Object.keys(dataEcuador);
  const ciudades = formData.provincia ? dataEcuador[formData.provincia] : [];

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addContact = () => {
    if (!contactoForm.apellidos ||  !contactoForm.nombre || !contactoForm.telefono) {
      alert('Por favor complete al menos el nombre y teléfono del contacto');
      return;
    }

    const newContact = {
      id: Date.now(),
      ...contactoForm
    };

    if (editingContact) {
      setFormData(prev => ({
        ...prev,
        contactos: prev.contactos.map(contact => 
          contact.id === editingContact ? { ...newContact, id: editingContact } : contact
        )
      }));
      setEditingContact(null);
      setIsModalOpen(false);
    } else {
      setFormData(prev => ({
        ...prev,
        contactos: [...prev.contactos, newContact]
      }));
    }

    setContactoForm({
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      relacion: ''
    });
  };

  const editContact = (contact) => {
    setContactoForm({
      nombre: contact.nombre,
      apellidos: contact.apellidos || '',  
      telefono: contact.telefono,
      email: contact.email,
      relacion: contact.relacion
    });
    setEditingContact(contact.id);
    setIsModalOpen(true);
  };

  const deleteContact = (contactId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este contacto?')) {
      setFormData(prev => ({
        ...prev,
        contactos: prev.contactos.filter(contact => contact.id !== contactId)
      }));
    }
  };

  const cancelEdit = () => {
    setEditingContact(null);
    setIsModalOpen(false);
    setContactoForm({
      nombre: '',
      apellidos: '',
      telefono: '',
      email: '',
      relacion: ''
    });
  };

  const handleSubmit = () => {
    if (!formData.apellidos || !formData.nombres || !formData.cedula || !formData.edad || !formData.sexo || !formData.fecha || !formData.causaEmergencia) {
      alert('Por favor complete todos los campos obligatorios marcados con *');
      return;
    }
    
    console.log('Datos del formulario:', formData);
    alert('Formulario enviado exitosamente!');
  };

  const handleProvinciaChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      provincia: value,
      ciudad: '' 
    }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-6 px-4">
      <div className="w-full max-w-none mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">FENIX</h1>
              <p className="text-purple-600 font-medium">Sistema Médico</p>
            </div>
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AccordionSection
            title="Datos del Paciente"
            icon={User}
            isOpen={openSections.paciente}
            onToggle={() => toggleSection('paciente')}
            required={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula *
                </label>
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad *
                </label>
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  min="0"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo *
                </label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Civil
                </label>
                <select
                  name="estadoCivil"
                  value={formData.estadoCivil}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Soltero">Soltero</option>
                  <option value="Casado">Casado</option>
                  <option value="Divorciado">Divorciado</option>
                  <option value="Viudo">Viudo</option>
                  <option value="Union Libre">Unión Libre</option>
                </select>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Información Adicional"
            icon={MapPin}
            isOpen={openSections.adicional}
            onToggle={() => toggleSection('adicional')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ocupación
                </label>
                <select
                  name="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Dependiente">Trabajador Dependiente</option>
                  <option value="Independiente">Trabajador Independiente</option>
                  <option value="Estudiante">Estudiante</option>
                  <option value="Jubilado">Jubilado</option>
                  <option value="Desempleado">Desempleado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instrucción
                </label>
                <select
                  name="instruccion"
                  value={formData.instruccion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Primaria">Primaria</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="Superior">Superior</option>
                  <option value="Ninguna">Ninguna</option>
                  <option value="N/A">No Aplica</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Procedencia
                </label>
                <select
                  name="procedencia"
                  value={formData.procedencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Urbana">Urbana</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincia
                </label>
                <select
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleProvinciaChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {provincias.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  disabled={!formData.provincia}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Seleccionar...</option>
                  {ciudades.map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector o Barrio
                </label>
                <input
                  type="text"
                  name="sectorBarrio"
                  value={formData.sectorBarrio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ingrese el sector o barrio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calle
                </label>
                <input
                  type="text"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ingrese la calle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Casa
                </label>
                <input
                  type="text"
                  name="numeroCasa"
                  value={formData.numeroCasa}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ingrese el número"
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Información Médica"
            icon={Stethoscope}
            isOpen={openSections.medica}
            onToggle={() => toggleSection('medica')}
            required={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Causa de la Emergencia *
                </label>
                <textarea
                  name="causaEmergencia"
                  value={formData.causaEmergencia}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe la causa de la emergencia..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuadro Clínico
                </label>
                <textarea
                  name="cuadroClinico"
                  value={formData.cuadroClinico}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe el cuadro clínico..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Examen Físico
                </label>
                <textarea
                  name="examenFisico"
                  value={formData.examenFisico}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Resultados del examen físico..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <textarea
                  name="diagnostico"
                  value={formData.diagnostico}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Diagnóstico médico..."
                />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Información de Contacto"
            icon={Phone}
            isOpen={openSections.contacto}
            onToggle={() => toggleSection('contacto')}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Agregar Nuevo Contacto
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos*
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={contactoForm.apellidos}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Apellidos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre*
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={contactoForm.nombre}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={contactoForm.telefono}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ej: 0987654321"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactoForm.email}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relación con el Paciente
                    </label>
                    <select
                      name="relacion"
                      value={contactoForm.relacion}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Esposo/a">Esposo/a</option>
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Abuelo/a">Abuelo/a</option>
                      <option value="Tío/a">Tío/a</option>
                      <option value="Primo/a">Primo/a</option>
                      <option value="Amigo/a">Amigo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Contacto
                  </button>
                </div>
              </div>

              {formData.contactos.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Contactos Guardados ({formData.contactos.length})
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Apellidos
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teléfono
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Relación
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.contactos.map((contacto) => (
                          <tr key={contacto.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contacto.apellidos}
                            </td>

                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contacto.nombre}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contacto.telefono}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contacto.email || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contacto.relacion || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => editContact(contacto)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar contacto"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteContact(contacto.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Eliminar contacto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {formData.contactos.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay contactos agregados</p>
                  <p className="text-sm">Use el formulario de arriba para agregar contactos</p>
                </div>
              )}
            </div>
          </AccordionSection>

          <div className="flex justify-end space-x-4 pb-6">
            <button
              type="button"
              className="px-8 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              Guardar Paciente
            </button>
          </div>
        </div>
      </div>

      {/* Modal para editar contacto */}
      <Modal
        isOpen={isModalOpen}
        onClose={cancelEdit}
        title="Editar Contacto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos *
            </label>
            <input
              type="text"
              name="apellidos"
              value={contactoForm.apellidos}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Apellidos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={contactoForm.nombre}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              name="telefono"
              value={contactoForm.telefono}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: 0987654321"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={contactoForm.email}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relación con el Paciente
            </label>
            <select
              name="relacion"
              value={contactoForm.relacion}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              <option value="Padre">Padre</option>
              <option value="Madre">Madre</option>
              <option value="Esposo/a">Esposo/a</option>
              <option value="Hijo/a">Hijo/a</option>
              <option value="Hermano/a">Hermano/a</option>
              <option value="Abuelo/a">Abuelo/a</option>
              <option value="Tío/a">Tío/a</option>
              <option value="Primo/a">Primo/a</option>
              <option value="Amigo/a">Amigo/a</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={cancelEdit}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={addContact}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Actualizar Contacto
          </button>
        </div>
      </Modal>
    </div>
  );
}