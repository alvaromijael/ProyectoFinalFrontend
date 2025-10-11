// Importaciones para PDF
import { Document, Page, Text as PDFText, View, StyleSheet } from '@react-pdf/renderer';
import type { Patient } from '../../interfaces/Patient';

interface Recipe {
  medicine: string;
  amount: string;
  instructions: string;
  lunchTime?: string;
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

// Estilos inspirados en el formato físico
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Header con logo y título
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  logoSection: {
    width: '30%',
  },
  titleSection: {
    width: '70%',
    alignItems: 'flex-end',
  },
  clinicName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 1,
  },
  // Información del doctor
  doctorSection: {
    backgroundColor: '#f8fafc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 4,
  },
  doctorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  doctorInfo: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 2,
  },
  // Datos del paciente
  patientSection: {
    marginBottom: 15,
  },
  patientRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  patientLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '25%',
    color: '#334155',
  },
  patientValue: {
    fontSize: 9,
    width: '75%',
    color: '#1e293b',
  },
  // Sección RP (Receta)
  rpSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  rpHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
    textAlign: 'center',
  },
  // Tabla de medicamentos
  medicineTable: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#94a3b8',
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 35,
  },
  tableCell: {
    fontSize: 9,
    color: '#1e293b',
  },
  // Columnas de la tabla
  colMedicine: {
    width: '30%',
    paddingRight: 5,
  },
  colAmount: {
    width: '15%',
    paddingRight: 5,
  },
  colInstructions: {
    width: '30%',
    paddingRight: 5,
  },
  colTime: {
    width: '15%',
    paddingRight: 5,
  },
  colObs: {
    width: '10%',
  },
  // Indicaciones
  indicationsSection: {
    marginTop: 15,
    marginBottom: 20,
  },
  indicationsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  indicationsBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    minHeight: 40,
  },
  indicationsText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.4,
  },
  // Firma
  signatureSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    width: 200,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  signatureSubtext: {
    fontSize: 8,
    color: '#64748b',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            {/* Aquí iría el logo si lo tienes */}
            <PDFText style={{ fontSize: 8, color: '#64748b' }}>
              Logo FENIX
            </PDFText>
          </View>
          <View style={styles.titleSection}>
            <PDFText style={styles.clinicName}>FENIX</PDFText>
            <PDFText style={styles.subtitle}>clínica</PDFText>
            <PDFText style={styles.subtitle}>Tu salud es nuestra prioridad</PDFText>
          </View>
        </View>

        {/* Información del Doctor */}
        {doctor && (
          <View style={styles.doctorSection}>
            <PDFText style={styles.doctorName}>
              {doctor.first_name} {doctor.last_name}
            </PDFText>
            <PDFText style={styles.doctorInfo}>
              Especialista en Pediatría
            </PDFText>
            <PDFText style={styles.doctorInfo}>
              Esmeraldas: NV 71, Quito 2 Julio 3 BB 17/1 (593) 99 21 85 67
            </PDFText>
          </View>
        )}

        {/* Datos del Paciente */}
        <View style={styles.patientSection}>
          <View style={styles.patientRow}>
            <PDFText style={styles.patientLabel}>Paciente:</PDFText>
            <PDFText style={styles.patientValue}>
              {patient.first_name} {patient.last_name}
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
              {patient.age || 'N/A'} años
            </PDFText>
          </View>
          <View style={styles.patientRow}>
            <PDFText style={styles.patientLabel}>Cita N°:</PDFText>
            <PDFText style={styles.patientValue}>
              {appointmentId}
            </PDFText>
          </View>
        </View>

        {/* RP - Receta */}
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
            <PDFText style={[styles.tableHeaderCell, styles.colTime]}>
              Hora de comida
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
                <PDFText style={[styles.tableCell, styles.colTime]}>
                  {recipe.lunchTime || '-'}
                </PDFText>
                <PDFText style={[styles.tableCell, styles.colObs]}>
                  {recipe.observations}
                </PDFText>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <PDFText style={[styles.tableCell, { width: '100%', textAlign: 'center', fontStyle: 'italic', color: '#94a3b8' }]}>
                No se registraron medicamentos
              </PDFText>
            </View>
          )}
        </View>

        {/* Indicaciones */}
        <View style={styles.indicationsSection}>
          <PDFText style={styles.indicationsTitle}>Indicaciones:</PDFText>
          <View style={styles.indicationsBox}>
            <PDFText style={styles.indicationsText}>
              {/* Aquí irían las indicaciones generales si las hay */}
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
              Re enviar rcp: ___ de ___
            </PDFText>
            <PDFText style={styles.footerText}>
              Atendido: el quiniche a ___ del 20__
            </PDFText>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default RecipePdf;