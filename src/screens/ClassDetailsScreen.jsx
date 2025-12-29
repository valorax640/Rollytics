import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';
import {
  getAttendanceByClass,
  calculateAttendancePercentage,
  updateClass,
} from '../utils/storage';
import StudentCard from '../components/StudentCard';
import Header from '../components/Header';

const ClassDetailsScreen = ({route, navigation}) => {
  const {classData} = route.params;
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [studentStats, setStudentStats] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const loadAttendance = async () => {
    const records = await getAttendanceByClass(classData.id);
    setAttendanceRecords(records);

    const percent = calculateAttendancePercentage(
      classData.students,
      records,
    );
    setPercentage(percent);

    // Calculate per-student stats
    const stats = {};
    classData.students.forEach(student => {
      let present = 0;
      let total = records.length;

      records.forEach(record => {
        const attendance = record.attendance.find(
          a => a.studentId === student.id,
        );
        if (attendance && attendance.status === 'present') {
          present++;
        }
      });

      stats[student.id] = {
        present,
        total,
        percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
      };
    });

    setStudentStats(stats);
  };

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, []),
  );

  const handleDeleteStudent = (studentId, studentName) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to remove ${studentName} from this class?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedStudents = classData.students.filter(
              s => s.id !== studentId,
            );
            const result = await updateClass(classData.id, {
              students: updatedStudents,
            });
            if (result) {
              classData.students = updatedStudents;
              loadAttendance();
              navigation.setParams({classData: {...classData}});
            } else {
              Alert.alert('Error', 'Failed to delete student');
            }
          },
        },
      ],
    );
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      Alert.alert('Error', 'Please enter student name');
      return;
    }

    const newStudent = {
      id: Date.now().toString(),
      name: newStudentName.trim(),
      rollNumber: `R${classData.students.length + 1}`,
    };

    const updatedStudents = [...classData.students, newStudent];
    const result = await updateClass(classData.id, {
      students: updatedStudents,
    });

    if (result) {
      classData.students = updatedStudents;
      setNewStudentName('');
      setShowAddModal(false);
      loadAttendance();
      navigation.setParams({classData: {...classData}});
      Alert.alert('Success', 'Student added successfully');
    } else {
      Alert.alert('Error', 'Failed to add student');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title={classData.name} 
        subtitle={`${classData.students.length} Students`} 
      />
      <ScrollView style={styles.content}>
        <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Icon name="check-circle" size={30} color={COLORS.success} />
          <Text style={styles.statValue}>{percentage}%</Text>
          <Text style={styles.statLabel}>Overall Attendance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="event" size={30} color={COLORS.primary} />
          <Text style={styles.statValue}>{attendanceRecords.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate('TakeAttendance', {classData})
          }>
          <Icon name="how-to-reg" size={24} color="#fff" />
          <Text style={styles.primaryButtonText}>Take Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate('AttendanceHistory', {classData})
          }>
          <Icon name="history" size={24} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>View History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Students</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {classData.students.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            stats={studentStats[student.id]}
            onDelete={() => handleDeleteStudent(student.id, student.name)}
          />
        ))}
      </View>
      </ScrollView>

      {/* Add Student Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Student</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Student Name</Text>
              <TextInput
                style={styles.input}
                value={newStudentName}
                onChangeText={setNewStudentName}
                placeholder="Enter student name"
                placeholderTextColor={COLORS.textSecondary}
                autoFocus={true}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setNewStudentName('');
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addStudentButton}
                onPress={handleAddStudent}>
                <Text style={styles.addStudentButtonText}>Add Student</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: COLORS.card,
    margin: 20,
    marginTop: 12,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtons: {
    padding: 20,
    paddingTop: 0,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: COLORS.backgroundDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  section: {
    padding: 20,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  addStudentButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  addStudentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ClassDetailsScreen;