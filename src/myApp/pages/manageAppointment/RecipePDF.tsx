// Importaciones para PDF
import { Document, Page, Text as PDFText, View, StyleSheet } from '@react-pdf/renderer';
import type { Patient } from '../../interfaces/Patient';

interface Recipe {
  medicine: string;
  amount: string;
  instructions: string;
  lunchTime?: string[]; // ✅ Cambiado a array
  observations: string;
}

interface Doctor {
  first_name?: string;
  last_name?: string;
  specialty?: string;
  license?: string;
}

interface RecipePDFProps {
  patient: Patient;
  doctor: Doctor | null;
  recipes: Recipe[];
  appointmentDate: string;
  appointmentId: string;
}

// Estilos inspirados en el MedicalRecord
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Header
  headerBar: {
    height: 8,
    backgroundColor: '#1E3A8A',
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logoSection: {
    width: '70%',
  },
  titleSection: {
    width: '30%',
    alignItems: 'flex-end',
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 1,
  },
  dateText: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 10,
  },
  // Información del doctor
  doctorSection: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    marginBottom: 15,
    borderRadius: 2,
  },
  doctorName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 3,
  },
  doctorInfo: {
    fontSize: 9,
    color: '#4B5563',
    marginBottom: 2,
  },
  // Título sección
  sectionTitleBox: {
    backgroundColor: '#1E3A8A',
    padding: 10,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Datos del paciente
  patientSection: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    marginBottom: 15,
  },
  patientSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  patientRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  patientLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '25%',
    color: '#1E3A8A',
  },
  patientValue: {
    fontSize: 10,
    width: '75%',
    color: '#1F2937',
  },
  // Sección RP
  rpSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  rpHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
    textAlign: 'center',
  },
  // Tabla de medicamentos
  medicineTable: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E3A8A',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 30,
  },
  tableCell: {
    fontSize: 9,
    color: '#1F2937',
  },
  tableCellCenter: {
    fontSize: 10,
    color: '#1F2937',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  // Columnas de la tabla
  colMedicine: {
    width: '25%',
    paddingRight: 5,
  },
  colAmount: {
    width: '12%',
    paddingRight: 5,
  },
  colInstructions: {
    width: '23%',
    paddingRight: 5,
  },
  colMeal: {
    width: '8%',
    paddingRight: 3,
  },
  colObs: {
    width: '16%',
  },
  // Indicaciones
  indicationsSection: {
    marginTop: 15,
    marginBottom: 20,
  },
  indicationsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  indicationsBox: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#1E3A8A',
    minHeight: 40,
  },
  indicationsText: {
    fontSize: 9,
    color: '#4B5563',
    lineHeight: 1.4,
  },
  // Firma
  signatureSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1.5,
    borderTopColor: '#1E3A8A',
    width: 200,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 2,
  },
  signatureSubtext: {
    fontSize: 8,
    color: '#6B7280',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    borderTopWidth: 3,
    borderTopColor: '#1E3A8A',
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
  },
});

const RecipePdf = ({ 
  patient, 
  doctor, 
  recipes, 
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

  // ✅ Función para verificar si tiene una comida específica
  const hasMeal = (lunchTime: string[] | undefined, meal: string): string => {
    if (!lunchTime || !Array.isArray(lunchTime)) return '';
    return lunchTime.includes(meal) ? 'X' : '';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Barra superior azul */}
        <View style={styles.headerBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <PDFText style={styles.clinicName}>Clínica FENIX</PDFText>
            <PDFText style={styles.subtitle}>Tu Salud Merece</PDFText>
            <PDFText style={styles.dateText}>
              El Quinche, {formatDate(new Date().toISOString())}
            </PDFText>
          </View>
          <View style={styles.titleSection}>
            <PDFText style={{ fontSize: 8, color: '#6B7280' }}>
              Logo FENIX
            </PDFText>
          </View>
        </View>

        {/* Título de sección */}
        <View style={styles.sectionTitleBox}>
          <PDFText style={styles.sectionTitle}>RECETA MÉDICA</PDFText>
        </View>

        {/* Información del Doctor */}
        {doctor && (
          <View style={styles.doctorSection}>
            <PDFText style={styles.doctorName}>
              Dra. {doctor.first_name} {doctor.last_name}
            </PDFText>
            <PDFText style={styles.doctorInfo}>
              Especialista en Pediatría
            </PDFText>
            <PDFText style={styles.doctorInfo}>
              dra.rosalespedia@outlook.es | Tel: 2 388 177 / 0995230857
            </PDFText>
            <PDFText style={styles.doctorInfo}>
              Dir: Emsara Mas N1-77 y Quito, El Quinche - Ecuador
            </PDFText>
          </View>
        )}

        {/* Datos del Paciente */}
        <View style={styles.patientSection}>
          <PDFText style={styles.patientSectionTitle}>DATOS DEL PACIENTE</PDFText>
          <View style={styles.patientRow}>
            <PDFText style={styles.patientLabel}>Paciente:</PDFText>
            <PDFText style={styles.patientValue}>
              {patient.first_name} {patient.last_name}
            </PDFText>
          </View>
          <View style={styles.patientRow}>
            <PDFText style={styles.patientLabel}>Cédula:</PDFText>
            <PDFText style={styles.patientValue}>
              {patient.document_id}
            </PDFText>
          </View>
          <View style={styles.patientRow}>
            <PDFText style={styles.patientLabel}>Fecha:</PDFText>
            <PDFText style={styles.patientValue}>
              {formatDate(appointmentDate)}
            </PDFText>
          </View>
          <View style={styles.patientRow}>
            <PDFText style={styles.patientLabel}>Edad:</PDFText>
            <PDFText style={styles.patientValue}>
              {patient.age || 'N/A'}
            </PDFText>
          </View>
          <View style={styles.patientRow}>
            <PDFText style={styles.patientLabel}>Cita N°:</PDFText>
            <PDFText style={styles.patientValue}>
              {appointmentId}
            </PDFText>
          </View>
        </View>

        {/* RP */}
        <View style={styles.rpSection}>
          <PDFText style={styles.rpHeader}>Rp.</PDFText>
        </View>

        {/* Tabla de Medicamentos */}
        <View style={styles.medicineTable}>
          <View style={styles.tableHeader}>
            <PDFText style={[styles.tableHeaderCell, styles.colMedicine]}>
              Medicina
            </PDFText>
            <PDFText style={[styles.tableHeaderCell, styles.colAmount]}>
              Cantidad
            </PDFText>
            <PDFText style={[styles.tableHeaderCell, styles.colInstructions]}>
              Instrucciones
            </PDFText>
            <PDFText style={[styles.tableHeaderCell, styles.colMeal]}>
              Desayuno
            </PDFText>
            <PDFText style={[styles.tableHeaderCell, styles.colMeal]}>
              Almuerzo
            </PDFText>
            <PDFText style={[styles.tableHeaderCell, styles.colMeal]}>
              Cena
            </PDFText>
            <PDFText style={[styles.tableHeaderCell, styles.colObs]}>
              Observaciones
            </PDFText>
          </View>
          
          {recipes && recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <View key={index} style={styles.tableRow}>
                <PDFText style={[styles.tableCell, styles.colMedicine]}>
                  {recipe.medicine}
                </PDFText>
                <PDFText style={[styles.tableCell, styles.colAmount]}>
                  {recipe.amount}
                </PDFText>
                <PDFText style={[styles.tableCell, styles.colInstructions]}>
                  {recipe.instructions}
                </PDFText>
                <PDFText style={[styles.tableCellCenter, styles.colMeal]}>
                  {hasMeal(recipe.lunchTime, 'desayuno')}
                </PDFText>
                <PDFText style={[styles.tableCellCenter, styles.colMeal]}>
                  {hasMeal(recipe.lunchTime, 'almuerzo')}
                </PDFText>
                <PDFText style={[styles.tableCellCenter, styles.colMeal]}>
                  {hasMeal(recipe.lunchTime, 'cena')}
                </PDFText>
                <PDFText style={[styles.tableCell, styles.colObs]}>
                  {recipe.observations}
                </PDFText>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <PDFText style={[styles.tableCell, { width: '100%', textAlign: 'center', fontStyle: 'italic', color: '#6B7280' }]}>
                No se registraron medicamentos
              </PDFText>
            </View>
          )}
        </View>

        {/* Indicaciones */}
        <View style={styles.indicationsSection}>
          <PDFText style={styles.indicationsTitle}>INDICACIONES</PDFText>
          <View style={styles.indicationsBox}>
            <PDFText style={styles.indicationsText}>
              Seguir el tratamiento según lo prescrito. En caso de presentar efectos secundarios o reacciones adversas, suspender el tratamiento y consultar inmediatamente.
            </PDFText>
          </View>
        </View>

        {/* Firma */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine} />
          <PDFText style={styles.signatureText}>
            {doctor ? `Dra. ${doctor.first_name} ${doctor.last_name}` : 'Firma del Médico'}
          </PDFText>
          <PDFText style={styles.signatureSubtext}>
            Responsable
          </PDFText>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <PDFText style={styles.footerText}>
              Receta válida por 30 días
            </PDFText>
            <PDFText style={styles.footerText}>
              Fecha de emisión: {formatDate(new Date().toISOString())}
            </PDFText>
          </View>
          <View style={styles.footerRow}>
            <PDFText style={styles.footerText}>
              dra.rosalespedia@outlook.es
            </PDFText>
            <PDFText style={styles.footerText}>
              Tel: 2 388 177 / 0995230857
            </PDFText>
          </View>
          <View style={styles.footerRow}>
            <PDFText style={styles.footerText}>
              El Quinche, Quito - Ecuador
            </PDFText>
            <PDFText style={styles.footerText}>
              Dir: Emsara Mas N1-77 y Quito
            </PDFText>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default RecipePdf;