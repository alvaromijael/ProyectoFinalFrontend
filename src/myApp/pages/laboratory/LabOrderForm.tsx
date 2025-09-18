// LabOrderForm.tsx
import React, { useState, useEffect, type JSX } from "react";
import labFields from "../../../assets/labFields.json";
import type { LabFields, OrderData, PatientData, PatientField, SelectedTests, TestCategory } from "../../interfaces/LaboratoryData";

const LabOrderForm: React.FC = () => {
  const [selectedTests, setSelectedTests] = useState<SelectedTests>({});
  const [patientData, setPatientData] = useState<PatientData>(
    (labFields as LabFields).patientFields.reduce(
      (acc: PatientData, field: PatientField) => {
        acc[field.id] =
          field.type === "select" && field.options ? field.options[1] : "";
        return acc;
      },
      {}
    )
  );
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<string>("");
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Hook para manejar el responsive
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para determinar el número de columnas basado en el ancho de ventana
  const getGridColumns = (): string => {
    if (windowWidth <= 768) return "1fr";
    if (windowWidth <= 1200) return "repeat(2, 1fr)";
    return "repeat(3, 1fr)";
  };

  const handleInputChange = (field: string, value: string): void => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (showError) setShowError("");
  };

  const handleTestChange = (
    category: string,
    test: string,
    checked: boolean
  ): void => {
    setSelectedTests((prev) => ({
      ...prev,
      [`${category}_${test}`]: checked,
    }));
  };

  const validateForm = (): string | null => {
    const requiredFields = (labFields as LabFields).patientFields.filter(
      (field) => field.required
    );
    for (let field of requiredFields) {
      if (!patientData[field.id]) {
        return `El campo "${field.label}" es obligatorio`;
      }
    }

    const selectedCount = Object.values(selectedTests).filter(Boolean).length;
    if (selectedCount === 0) {
      return "Seleccione al menos un examen de laboratorio";
    }

    return null;
  };

  const handleSubmit = (): void => {
    const error = validateForm();
    if (error) {
      setShowError(error);
      return;
    }

    const selectedTestsList = Object.entries(selectedTests)
      .filter(([, value]) => value) // Cambiado de [key, value] a [, value] ya que key no se usa
      .map(([key]) => key.replace(/_/g, " - ")); // Solo usar key aquí

    const orderData: OrderData = {
      selectedTests: selectedTestsList,
      totalTests: selectedTestsList.length,
      createdAt: new Date().toISOString(),
      ...patientData,
    };

    console.log("Datos del pedido:", orderData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePrint = (): void => {
    window.print();
  };

  const handleClear = (): void => {
    setPatientData(
      (labFields as LabFields).patientFields.reduce(
        (acc: PatientData, field: PatientField) => {
          acc[field.id] =
            field.type === "select" && field.options ? field.options[1] : "";
          return acc;
        },
        {}
      )
    );
    setSelectedTests({});
    setShowError("");
    setShowSuccess(false);
  };

  const getSelectedCount = (): number => {
    return Object.values(selectedTests).filter(Boolean).length;
  };

  const renderField = (field: PatientField): JSX.Element => {
    const baseStyle: React.CSSProperties = {
      width: "100%",
      padding: "8px 12px",
      fontSize: "14px",
      border: "1px solid #d0d0d0",
      borderRadius: "6px",
      marginTop: "4px",
      transition: "border-color 0.3s ease",
    };

    const handleFocus = (
      e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      e.target.style.borderColor = "#1890ff";
    };

    const handleBlur = (
      e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      e.target.style.borderColor = "#d0d0d0";
    };

    switch (field.type) {
      case "select":
        return (
          <select
            style={baseStyle}
            value={patientData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            style={baseStyle}
            placeholder={field.placeholder}
            value={patientData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            min={field.min}
            max={field.max}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        );
      case "date":
        return (
          <input
            type="date"
            style={baseStyle}
            value={patientData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        );
      default:
        return (
          <input
            type="text"
            style={baseStyle}
            placeholder={field.placeholder}
            value={patientData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        );
    }
  };

  const renderTestCategory = (
    categoryKey: string,
    categoryData: TestCategory
  ): JSX.Element => (
    <div
      key={categoryKey}
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        marginBottom: "16px",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          backgroundColor: `${categoryData.color}12`,
          borderBottom: `2px solid ${categoryData.color}`,
          padding: "10px 16px",
          fontWeight: "600",
          fontSize: "13px",
          color: categoryData.color,
          textTransform: "uppercase" as const,
          letterSpacing: "0.5px"
        }}
      >
        {categoryData.title}
      </div>
      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "8px",
          }}
        >
          {categoryData.tests.map((test: string) => (
            <label
              key={test}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "6px 8px",
                borderRadius: "4px",
                transition: "background-color 0.2s ease",
                fontSize: "12px",
                lineHeight: "1.3",
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.backgroundColor = "transparent";
              }}
            >
              <input
                type="checkbox"
                checked={selectedTests[`${categoryKey}_${test}`] || false}
                onChange={(e) =>
                  handleTestChange(categoryKey, test, e.target.checked)
                }
                style={{
                  marginRight: "8px",
                  transform: "scale(1.1)",
                  accentColor: categoryData.color,
                }}
              />
              {test}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const buttonStyle: React.CSSProperties = {
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    minWidth: "140px",
    transition: "all 0.3s ease",
  };

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h1
            style={{
              color: "#1890ff",
              margin: "0 0 6px 0",
              fontSize: "24px",
              fontWeight: "700",
            }}
          >
            🏥 LABORATORIO CLÍNICO
          </h1>
          <p
            style={{
              color: "#666",
              margin: 0,
              fontSize: "14px",
            }}
          >
            Clínica FENIX - Tu Salud Renace
          </p>
        </div>

        {/* Mensajes */}
        {showSuccess && (
          <div
            style={{
              backgroundColor: "#f6ffed",
              border: "1px solid #52c41a",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              color: "#52c41a",
              fontWeight: "600",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            ✅ Pedido creado exitosamente con {getSelectedCount()} exámenes
          </div>
        )}

        {showError && (
          <div
            style={{
              backgroundColor: "#fff2f0",
              border: "1px solid #ff4d4f",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              color: "#ff4d4f",
              fontWeight: "600",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            ❌ {showError}
          </div>
        )}

        {/* Información del Paciente */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              color: "#1890ff",
              marginBottom: "20px",
              fontSize: "18px",
              fontWeight: "600",
              borderBottom: "2px solid #1890ff",
              paddingBottom: "8px",
            }}
          >
            👤 Información del Paciente
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {(labFields as LabFields).patientFields.map(
              (field: PatientField) => (
                <div key={field.id}>
                  <label
                    style={{
                      fontWeight: "600",
                      color: "#333",
                      fontSize: "14px",
                      display: "block",
                    }}
                  >
                    {field.label}{" "}
                    {field.required && (
                      <span style={{ color: "#ff4d4f" }}>*</span>
                    )}
                  </label>
                  {renderField(field)}
                </div>
              )
            )}
          </div>
        </div>

        {/* Contador de exámenes */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "2px solid #1890ff",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#1890ff",
            }}
          >
            🧪 Exámenes Seleccionados: {getSelectedCount()}
          </span>
        </div>

        {/* Selección de Exámenes - Responsive */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              color: "#1890ff",
              marginBottom: "20px",
              fontSize: "18px",
              fontWeight: "600",
              borderBottom: "2px solid #1890ff",
              paddingBottom: "8px",
            }}
          >
            🔬 Selección de Exámenes de Laboratorio
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: getGridColumns(), // Función para responsive
              gap: "16px",
            }}
          >
            {Object.entries((labFields as LabFields).categories).map(
              ([key, category]) => renderTestCategory(key, category)
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleSubmit}
              style={{
                ...buttonStyle,
                backgroundColor: "#1890ff",
                color: "white",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "#40a9ff";
                target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "#1890ff";
                target.style.transform = "translateY(0)";
              }}
            >
              💾 Crear Pedido
            </button>

            <button
              onClick={handlePrint}
              style={{
                ...buttonStyle,
                backgroundColor: "#52c41a",
                color: "white",
                boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)",
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "#73d13d";
                target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "#52c41a";
                target.style.transform = "translateY(0)";
              }}
            >
              🖨️ Imprimir
            </button>

            <button
              onClick={handleClear}
              style={{
                ...buttonStyle,
                backgroundColor: "#ff4d4f",
                color: "white",
                boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "#ff7875";
                target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "#ff4d4f";
                target.style.transform = "translateY(0)";
              }}
            >
              🗑️ Limpiar Formulario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabOrderForm;