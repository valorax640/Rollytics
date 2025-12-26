import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
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
        <Text style={styles.sectionTitle}>Students</Text>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
});

export default ClassDetailsScreen;