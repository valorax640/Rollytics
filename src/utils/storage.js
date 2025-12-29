import AsyncStorage from '@react-native-async-storage/async-storage';

const CLASSES_KEY = '@rollytics_classes';
const ATTENDANCE_KEY = '@rollytics_attendance';

// Classes Storage
export const saveClasses = async classes => {
  try {
    await AsyncStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
    return true;
  } catch (error) {
    console.error('Error saving classes:', error);
    return false;
  }
};

export const getClasses = async () => {
  try {
    const data = await AsyncStorage.getItem(CLASSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting classes:', error);
    return [];
  }
};

export const addClass = async newClass => {
  try {
    const classes = await getClasses();
    const classWithId = {
      ...newClass,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    classes.push(classWithId);
    await saveClasses(classes);
    return classWithId;
  } catch (error) {
    console.error('Error adding class:', error);
    return null;
  }
};

export const updateClass = async (classId, updatedData) => {
  try {
    const classes = await getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index !== -1) {
      classes[index] = {... classes[index], ...updatedData};
      await saveClasses(classes);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating class:', error);
    return false;
  }
};

export const deleteClass = async classId => {
  try {
    const classes = await getClasses();
    const filtered = classes.filter(c => c.id !== classId);
    await saveClasses(filtered);
    // Also delete related attendance
    const attendance = await getAttendance();
    const filteredAttendance = attendance.filter(a => a.classId !== classId);
    await saveAttendance(filteredAttendance);
    return true;
  } catch (error) {
    console.error('Error deleting class:', error);
    return false;
  }
};

// Attendance Storage
export const saveAttendance = async attendance => {
  try {
    await AsyncStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
    return true;
  } catch (error) {
    console.error('Error saving attendance:', error);
    return false;
  }
};

export const getAttendance = async () => {
  try {
    const data = await AsyncStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting attendance:', error);
    return [];
  }
};

export const addAttendanceRecord = async record => {
  try {
    const attendance = await getAttendance();
    const recordWithId = {
      ...record,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    attendance.push(recordWithId);
    await saveAttendance(attendance);
    return recordWithId;
  } catch (error) {
    console.error('Error adding attendance record:', error);
    return null;
  }
};

export const getAttendanceByClass = async classId => {
  try {
    const attendance = await getAttendance();
    return attendance.filter(a => a.classId === classId);
  } catch (error) {
    console.error('Error getting attendance by class:', error);
    return [];
  }
};

export const updateAttendanceRecord = async (recordId, updatedData) => {
  try {
    const attendance = await getAttendance();
    const index = attendance.findIndex(a => a.id === recordId);
    if (index !== -1) {
      attendance[index] = {...attendance[index], ...updatedData};
      await saveAttendance(attendance);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating attendance record:', error);
    return false;
  }
};

export const deleteAttendanceRecord = async recordId => {
  try {
    const attendance = await getAttendance();
    const filtered = attendance.filter(a => a.id !== recordId);
    await saveAttendance(filtered);
    return true;
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    return false;
  }
};

export const calculateAttendancePercentage = (classStudents, attendanceRecords) => {
  if (!classStudents || classStudents.length === 0) return 0;
  if (!attendanceRecords || attendanceRecords.length === 0) return 0;

  let totalPresent = 0;
  let totalSessions = attendanceRecords.length;

  attendanceRecords.forEach(record => {
    const presentCount = record.attendance.filter(a => a.status === 'present').length;
    totalPresent += presentCount;
  });

  const totalPossible = classStudents.length * totalSessions;
  return totalPossible > 0 ? ((totalPresent / totalPossible) * 100).toFixed(2) : 0;
};