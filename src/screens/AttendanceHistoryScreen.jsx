import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';
import {
  getAttendanceByClass,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} from '../utils/storage';
import AttendanceItem from '../components/AttendanceItem';
import Header from '../components/Header';

const AttendanceHistoryScreen = ({route, navigation}) => {
  const {classData} = route.params;
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editedAttendance, setEditedAttendance] = useState({});

  const loadAttendance = async () => {
    const records = await getAttendanceByClass(classData.id);
    setAttendanceRecords(records.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    ));
  };

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, []),
  );

  const handleEdit = record => {
    setSelectedRecord(record);
    const attendance = {};
    record.attendance.forEach(a => {
      attendance[a.studentId] = a.status;
    });
    setEditedAttendance(attendance);
    setShowEditModal(true);
  };

  const handleDelete = record => {
    Alert.alert(
      'Delete Attendance',
      `Are you sure you want to delete attendance for ${new Date(
        record.date,
      ).toLocaleDateString()}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAttendanceRecord(record.id);
            if (success) {
              loadAttendance();
              Alert.alert('Success', 'Attendance record deleted');
            } else {
              Alert.alert('Error', 'Failed to delete attendance record');
            }
          },
        },
      ],
    );
  };

  const handleSaveEdit = async () => {
    const updatedAttendanceArray = Object.keys(editedAttendance).map(
      studentId => ({
        studentId,
        status: editedAttendance[studentId],
      }),
    );

    const success = await updateAttendanceRecord(selectedRecord.id, {
      attendance: updatedAttendanceArray,
    });

    if (success) {
      setShowEditModal(false);
      setSelectedRecord(null);
      setEditedAttendance({});
      loadAttendance();
      Alert.alert('Success', 'Attendance updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const toggleAttendance = studentId => {
    setEditedAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Attendance History" 
        subtitle={classData.name} 
      />
      <View style={styles.content}>
        {attendanceRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="event-busy" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No attendance records</Text>
          <Text style={styles.emptySubtext}>
            Take attendance to see records here
          </Text>
        </View>
      ) : (
        <FlatList
          data={attendanceRecords}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <AttendanceItem
              record={item}
              classData={classData}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
      </View>

      {/* Edit Attendance Modal */}
      {selectedRecord && (
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Attendance</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Icon name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDate}>
                {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>

              <ScrollView style={styles.studentsList}>
                {classData.students.map(student => {
                  const status = editedAttendance[student.id];
                  const isPresent = status === 'present';

                  return (
                    <TouchableOpacity
                      key={student.id}
                      style={styles.studentItem}
                      onPress={() => toggleAttendance(student.id)}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentRoll}>{student.rollNumber}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          isPresent
                            ? styles.presentBadge
                            : styles.absentBadge,
                        ]}>
                        <Icon
                          name={isPresent ? 'check-circle' : 'cancel'}
                          size={20}
                          color={isPresent ? COLORS.success : COLORS.danger}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            isPresent
                              ? styles.presentText
                              : styles.absentText,
                          ]}>
                          {isPresent ? 'Present' : 'Absent'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEditModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveEdit}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  listContainer: {
    padding: 20,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 20,
    letterSpacing: 0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
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
    width: '90%',
    maxHeight: '80%',
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalDate: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontWeight: '600',
  },
  studentsList: {
    maxHeight: 400,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  studentRoll: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  presentBadge: {
    backgroundColor: `${COLORS.success}15`,
  },
  absentBadge: {
    backgroundColor: `${COLORS.danger}15`,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  presentText: {
    color: COLORS.success,
  },
  absentText: {
    color: COLORS.danger,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AttendanceHistoryScreen;