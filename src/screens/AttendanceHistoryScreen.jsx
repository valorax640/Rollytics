import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';
import {getAttendanceByClass} from '../utils/storage';
import AttendanceItem from '../components/AttendanceItem';
import Header from '../components/Header';

const AttendanceHistoryScreen = ({route}) => {
  const {classData} = route.params;
  const [attendanceRecords, setAttendanceRecords] = useState([]);

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
            <AttendanceItem record={item} classData={classData} />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
      </View>
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
});

export default AttendanceHistoryScreen;