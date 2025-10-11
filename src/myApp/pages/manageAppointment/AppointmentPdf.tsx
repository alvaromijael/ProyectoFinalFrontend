// Importaciones para PDF
import { Document, Page, Text as PDFText, View, StyleSheet } from '@react-pdf/renderer';
import type { Appointment } from '../../services/AppointmentService';
import type { Diagnosis } from '../../interfaces/Appointment';

interface Recipe {
  medicine: string;
  amount: string;
  instructions: string;
  lunchTime?: string;
  observations: string;
}

interface Patient {
  first_name?: string;
  last_name?: string;
  document_id?: string;
  medical_history?: string;
}

interface Doctor {
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface RecipePDFProps {
  patient: Patient;
  doctor: Doctor | null;
  recipes: Recipe[];
  diagnoses: Diagnosis[];
  general: Appointment;
  appointmentDate: string;
  appointmentId: string;
}

// Estilos mejorados para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Header con diseño mejorado
  header: {
    marginBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 3,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Secciones
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    padding: 6,
    borderRadius: 3,
  },
  // Info general
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoBox: {
    width: '48%',
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 3,
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 7,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    color: '#1e293b',
    fontWeight: 'normal',
  },
  // Tablas
  table: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'solid',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderBottomWidth: 2,
    borderBottomColor: '#94a3b8',
    borderBottomStyle: 'solid',
    padding: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    padding: 5,
    minHeight: 28,
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 9,
    color: '#1e293b',
    paddingRight: 5,
  },
  // Columnas de tabla de diagnósticos
  diagnosisTypeCol: {
    width: '20%',
  },
  diagnosisCodeCol: {
    width: '20%',
  },
  diagnosisDescCol: {
    width: '60%',
  },
  // Columnas de tabla de recetas
  recipeNumCol: {
    width: '8%',
  },
  recipeMedicineCol: {
    width: '25%',
  },
  recipeAmountCol: {
    width: '12%',
  },
  recipeInstructionsCol: {
    width: '30%',
  },
  recipeTimeCol: {
    width: '12%',
  },
  recipeObsCol: {
    width: '13%',
  },
  // Texto destacado
  textBox: {
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    borderLeftStyle: 'solid',
    marginBottom: 4,
  },
  textContent: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.4,
  },
  // Firma
  signatureSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 2,
    borderTopColor: '#1e293b',
    borderTopStyle: 'solid',
    width: 200,
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 3,
  },
  signatureRole: {
    fontSize: 9,
    color: '#64748b',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  footerText: {
    marginBottom: 2,
  },
  // Badge para tipo de diagnóstico
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  badgeSecondary: {
    backgroundColor: '#f3e8ff',
  },
  badgeSecondaryText: {
    color: '#6b21a8',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    fontStyle: 'italic',
    padding: 10,
    fontSize: 8,
  },
});

const AppointmentPdf = ({ 
  patient, 
  doctor, 
  recipes, 
  diagnoses,
  general,
  appointmentDate, 
  appointmentId 
}: RecipePDFProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <PDFText style={styles.title}>FENIX</PDFText>
          <PDFText style={styles.subtitle}>Historia Clínica y Prescripción Médica</PDFText>
        </View>

        {/* Información de la cita y paciente */}
        <View style={styles.section}>
          <PDFText style={styles.sectionTitle}>Información General</PDFText>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Cita N°</PDFText>
              <PDFText style={styles.infoValue}>{appointmentId}</PDFText>
            </View>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Fecha de Atención</PDFText>
              <PDFText style={styles.infoValue}>{formatDate(appointmentDate)}</PDFText>
            </View>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Paciente</PDFText>
              <PDFText style={styles.infoValue}>
                {patient.first_name} {patient.last_name}
              </PDFText>
            </View>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Cédula</PDFText>
              <PDFText style={styles.infoValue}>{patient.document_id || 'N/A'}</PDFText>
            </View>
            {doctor && (
              <>
                <View style={styles.infoBox}>
                  <PDFText style={styles.infoLabel}>Médico Tratante</PDFText>
                  <PDFText style={styles.infoValue}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </PDFText>
                </View>
                <View style={styles.infoBox}>
                  <PDFText style={styles.infoLabel}>Contacto</PDFText>
                  <PDFText style={styles.infoValue}>{doctor.email}</PDFText>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Signos Vitales */}
        <View style={styles.section}>
          <PDFText style={styles.sectionTitle}>Signos Vitales</PDFText>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Temperatura</PDFText>
              <PDFText style={styles.infoValue}>{general.temperature} °C</PDFText>
            </View>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Presión Arterial</PDFText>
              <PDFText style={styles.infoValue}>{general.blood_pressure} mmHg</PDFText>
            </View>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Frecuencia Cardíaca</PDFText>
              <PDFText style={styles.infoValue}>{general.heart_rate} lpm</PDFText>
            </View>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Saturación O₂</PDFText>
              <PDFText style={styles.infoValue}>{general.oxygen_saturation} %</PDFText>
            </View>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Peso</PDFText>
              <PDFText style={styles.infoValue}>{general.weight} {general.weight_unit}</PDFText>
            </View>
            <View style={styles.infoBox}>
              <PDFText style={styles.infoLabel}>Talla</PDFText>
              <PDFText style={styles.infoValue}>{general.height} m</PDFText>
            </View>
          </View>
        </View>

        {/* Anamnesis */}
        <View style={styles.section}>
          <PDFText style={styles.sectionTitle}>Anamnesis</PDFText>
          {patient.medical_history && (
            <View style={styles.textBox}>
              <PDFText style={styles.infoLabel}>Antecedentes Médicos</PDFText>
              <PDFText style={styles.textContent}>{patient.medical_history}</PDFText>
            </View>
          )}
          {general.current_illness && (
            <View style={styles.textBox}>
              <PDFText style={styles.infoLabel}>Enfermedad Actual</PDFText>
              <PDFText style={styles.textContent}>{general.current_illness}</PDFText>
            </View>
          )}
        </View>

        {/* Examen Físico */}
        {general.physical_examination && (
          <View style={styles.section}>
            <PDFText style={styles.sectionTitle}>Examen Físico</PDFText>
            <View style={styles.textBox}>
              <PDFText style={styles.textContent}>{general.physical_examination}</PDFText>
            </View>
          </View>
        )}

        {/* Diagnósticos - TABLA */}
        <View style={styles.section}>
          <PDFText style={styles.sectionTitle}>Diagnósticos</PDFText>
          {diagnoses && diagnoses.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <PDFText style={[styles.tableHeaderCell, styles.diagnosisTypeCol]}>
                  Tipo
                </PDFText>
                <PDFText style={[styles.tableHeaderCell, styles.diagnosisCodeCol]}>
                  Código CIE-10
                </PDFText>
                <PDFText style={[styles.tableHeaderCell, styles.diagnosisDescCol]}>
                  Descripción
                </PDFText>
              </View>
              {diagnoses.map((diagnosis, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow                  ]}
                >
                  <View style={styles.diagnosisTypeCol}>
                    <View 
                      style={[
                        styles.badge,                      ]}
                    >
                      <PDFText 
                        style={[
                          styles.badgeText,                        ]}
                      >
                        {diagnosis.diagnosis_type === 'primary' ? 'Principal' : 'Secundario'}
                      </PDFText>
                    </View>
                  </View>
                  <PDFText style={[styles.tableCell, styles.diagnosisCodeCol]}>
                    {diagnosis.diagnosis_code}
                  </PDFText>
                  <PDFText style={[styles.tableCell, styles.diagnosisDescCol]}>
                    {diagnosis.diagnosis_description}
                  </PDFText>
                </View>
              ))}
            </View>
          ) : (
            <PDFText style={styles.emptyState}>
              No se registraron diagnósticos para esta consulta
            </PDFText>
          )}
        </View>

        {/* Prescripción Médica - TABLA */}
        <View style={styles.section}>
          <PDFText style={styles.sectionTitle}>Prescripción Médica</PDFText>
          {recipes && recipes.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <PDFText style={[styles.tableHeaderCell, styles.recipeNumCol]}>
                  N°
                </PDFText>
                <PDFText style={[styles.tableHeaderCell, styles.recipeMedicineCol]}>
                  Medicamento
                </PDFText>
                <PDFText style={[styles.tableHeaderCell, styles.recipeAmountCol]}>
                  Cantidad
                </PDFText>
                <PDFText style={[styles.tableHeaderCell, styles.recipeInstructionsCol]}>
                  Instrucciones
                </PDFText>
                <PDFText style={[styles.tableHeaderCell, styles.recipeTimeCol]}>
                  Horario
                </PDFText>
                <PDFText style={[styles.tableHeaderCell, styles.recipeObsCol]}>
                  Observ.
                </PDFText>
              </View>
              {recipes.map((recipe, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.tableRow,
                  ]}
                >
                  <PDFText style={[styles.tableCell, styles.recipeNumCol]}>
                    {index + 1}
                  </PDFText>
                  <PDFText style={[styles.tableCell, styles.recipeMedicineCol]}>
                    {recipe.medicine || '-'}
                  </PDFText>
                  <PDFText style={[styles.tableCell, styles.recipeAmountCol]}>
                    {recipe.amount || '-'}
                  </PDFText>
                  <PDFText style={[styles.tableCell, styles.recipeInstructionsCol]}>
                    {recipe.instructions || '-'}
                  </PDFText>
                  <PDFText style={[styles.tableCell, styles.recipeTimeCol]}>
                    {recipe.lunchTime || '-'}
                  </PDFText>
                  <PDFText style={[styles.tableCell, styles.recipeObsCol]}>
                    {recipe.observations || '-'}
                  </PDFText>
                </View>
              ))}
            </View>
          ) : (
            <PDFText style={styles.emptyState}>
              No se registraron medicamentos para esta consulta
            </PDFText>
          )}
        </View>

        {/* Indicaciones Generales */}
        {general.medical_preinscription && (
          <View style={styles.section}>
            <PDFText style={styles.sectionTitle}>Indicaciones Médicas Generales</PDFText>
            <View style={styles.textBox}>
              <PDFText style={styles.textContent}>{general.medical_preinscription}</PDFText>
            </View>
          </View>
        )}

        {/* Observaciones */}
        {general.observations && (
          <View style={styles.section}>
            <PDFText style={styles.sectionTitle}>Observaciones</PDFText>
            <View style={styles.textBox}>
              <PDFText style={styles.textContent}>{general.observations}</PDFText>
            </View>
          </View>
        )}

        {/* Firma */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine} />
          <PDFText style={styles.signatureName}>
            {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Firma del Médico'}
          </PDFText>
          <PDFText style={styles.signatureRole}>Médico Tratante</PDFText>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <PDFText style={styles.footerText}>
            Sistema de Gestión Médica FENIX | Documento Generado Electrónicamente
          </PDFText>
          <PDFText style={styles.footerText}>
            Fecha de emisión: {new Date().toLocaleDateString('es-EC', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </PDFText>
        </View>
      </Page>
    </Document>
  );
};

export default AppointmentPdf;