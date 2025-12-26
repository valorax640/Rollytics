import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';
import {addAttendanceRecord} from '../utils/storage';
import Header from '../components/Header';

const TakeAttendanceScreen = ({route, navigation}) => {
  const {classData} = route.params;
  const [attendance, setAttendance] = useState(
    classData.students.map(student => ({
      studentId: student.id,
      studentName: student.name,
      status: 'present', // default to present
    })),
  );

  const toggleAttendance = studentId => {
    setAttendance(prev =>
      prev.map(item =>
        item.studentId === studentId
          ? {
              ...item,
              status: item.status === 'present' ? 'absent' : 'present',
            }
          : item,
      ),
    );
  };

  const handleSaveAttendance = async () => {
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;

    Alert.alert(
      'Save Attendance',
      `Present: ${presentCount}\nAbsent: ${absentCount}\n\nSave this attendance record?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Save',
          onPress: async () => {
            const record = {
              classId: classData.id,
              className: classData.name,
              date: new Date().toISOString(),
              attendance: attendance,
            };

            const result = await addAttendanceRecord(record);
            if (result) {
              Alert.alert('Success', 'Attendance saved successfully', [
                {text: 'OK', onPress: () => navigation.goBack()},
              ]);
            } else {
              Alert.alert('Error', 'Failed to save attendance');
            }
          },
        },
      ],
    );
  };

  const renderStudent = ({item}) => {
    const student = classData.students.find(s => s.id === item.studentId);
    const isPresent = item.status === 'present';

    return (
      <TouchableOpacity
        style={[
          styles.studentItem,
          isPresent ? styles.presentItem : styles.absentItem,
        ]}
        onPress={() => toggleAttendance(item.studentId)}>
        <View style={styles.studentInfo}>
          <Icon
            name={isPresent ? 'check-circle' : 'cancel'}
            size={28}
            color={isPresent ? COLORS.present : COLORS.absent}
          />
          <Text style={styles.studentName}>{student.name}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            isPresent ? styles.presentBadge : styles.absentBadge,
          ]}>
          <Text
            style={[
              styles.statusText,
              isPresent ? styles.presentText : styles.absentText,
            ]}>
            {isPresent ? 'Present' : 'Absent'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  return (
    <View style={styles.container}>
      <Header 
        title="Take Attendance" 
        subtitle={classData.name} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        <View style={styles.header}>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{presentCount}</Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{absentCount}</Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={attendance}
        keyExtractor={item => item.studentId.toString()}
        renderItem={renderStudent}
        contentContainerStyle={styles.listContainer}
      />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAttendance}>
          <Icon name="save" size={24} color="#fff" />
          <Text style={styles.saveButtonText}>Save Attendance</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
  header: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderBottomWidth: 0,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.4,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingTop: 16,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  presentItem: {
    borderColor: COLORS.present,
    backgroundColor: `${COLORS.present}05`,
  },
  absentItem: {
    borderColor: COLORS.absent,
    backgroundColor: `${COLORS.absent}05`,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentName: {
    fontSize: 17,
    color: COLORS.text,
    marginLeft: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },
  presentBadge: {
    backgroundColor: `${COLORS.present}20`,
  },
  absentBadge: {
    backgroundColor: `${COLORS.absent}20`,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  presentText: {
    color: COLORS.present,
  },
  absentText: {
    color: COLORS.absent,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    margin: 20,
    borderRadius: 14,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.4,
  },
});

export default TakeAttendanceScreen;