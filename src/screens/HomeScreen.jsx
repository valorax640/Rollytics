import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants/colors';
import {getClasses, addClass, deleteClass} from '../utils/storage';
import ClassCard from '../components/ClassCard';
import Header from '../components/Header';

const HomeScreen = ({navigation}) => {
  const [classes, setClasses] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState('');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [studentSelectModalVisible, setStudentSelectModalVisible] = useState(false);
  const [selectedClassForImport, setSelectedClassForImport] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const loadClasses = async () => {
    const data = await getClasses();
    setClasses(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadClasses();
    }, []),
  );

  const handleAddClass = async () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }
    if (!students.trim()) {
      Alert.alert('Error', 'Please add at least one student');
      return;
    }

    const studentList = students
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map((name, index) => ({
        id: Date.now() + index,
        name,
      }));

    if (studentList.length === 0) {
      Alert.alert('Error', 'Please add at least one student');
      return;
    }

    const newClass = {
      name: className,
      students: studentList,
    };

    const result = await addClass(newClass);
    if (result) {
      setClassName('');
      setStudents('');
      setModalVisible(false);
      loadClasses();
    } else {
      Alert.alert('Error', 'Failed to add class');
    }
  };

  const handleImportStudents = () => {
    if (classes.length === 0) {
      Alert.alert('No Classes', 'There are no existing classes to import students from.');
      return;
    }
    setImportModalVisible(true);
  };

  const handleClassSelection = (classData) => {
    setSelectedClassForImport(classData);
    // Initialize all students as selected
    setSelectedStudents(classData.students.map(s => ({...s, selected: true})));
    setImportModalVisible(false);
    setStudentSelectModalVisible(true);
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.map(s =>
        s.id === studentId ? {...s, selected: !s.selected} : s
      )
    );
  };

  const handleConfirmImport = () => {
    const importedStudents = selectedStudents
      .filter(s => s.selected)
      .map(s => s.name)
      .join('\n');
    
    if (importedStudents) {
      // Append to existing students or replace
      setStudents(prev => {
        const existing = prev.trim();
        if (existing) {
          return existing + '\n' + importedStudents;
        }
        return importedStudents;
      });
    }
    
    setStudentSelectModalVisible(false);
    setSelectedClassForImport(null);
    setSelectedStudents([]);
  };

  const handleDeleteClass = classId => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class?  All attendance records will be lost.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteClass(classId);
            if (result) {
              loadClasses();
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Rollytics" subtitle="Manage your classes" />
      <View style={styles.content}>
        {classes.length === 0 ? (
          <View style={styles.emptyContainer}>
          <Icon name="school" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No classes yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first class
          </Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ClassCard
              classData={item}
              onPress={() =>
                navigation.navigate('ClassDetails', {classData: item})
              }
              onDelete={() => handleDeleteClass(item.id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}>
              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add New Class</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Class Name (e.g., Computer Science 101)"
                    value={className}
                    onChangeText={setClassName}
                  />

                  <Text style={styles.label}>
                    Students (one per line):
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="John Doe&#10;Jane Smith&#10;Bob Johnson"
                    value={students}
                    onChangeText={setStudents}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    style={styles.importButton}
                    onPress={handleImportStudents}>
                    <Icon name="file-download" size={20} color={COLORS.primary} />
                    <Text style={styles.importButtonText}>Import from Existing Class</Text>
                  </TouchableOpacity>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        setModalVisible(false);
                        setClassName('');
                        setStudents('');
                      }}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.addButton]}
                      onPress={handleAddClass}>
                      <Text style={styles.addButtonText}>Add Class</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Import Class Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={importModalVisible}
        onRequestClose={() => setImportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.importModalContent}>
            <Text style={styles.modalTitle}>Select Class to Import From</Text>
            <ScrollView style={styles.classListContainer}>
              {classes.map((classItem) => (
                <TouchableOpacity
                  key={classItem.id}
                  style={styles.classImportItem}
                  onPress={() => handleClassSelection(classItem)}>
                  <View style={styles.classImportInfo}>
                    <Text style={styles.classImportName}>{classItem.name}</Text>
                    <Text style={styles.classImportStudentCount}>
                      {classItem.students.length} student{classItem.students.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.singleCancelButton}
              onPress={() => setImportModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Student Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={studentSelectModalVisible}
        onRequestClose={() => setStudentSelectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.importModalContent}>
            <Text style={styles.modalTitle}>Select Students to Import</Text>
            <Text style={styles.modalSubtitle}>
              From: {selectedClassForImport?.name}
            </Text>
            <ScrollView style={styles.studentListContainer}>
              {selectedStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  style={styles.studentSelectItem}
                  onPress={() => toggleStudentSelection(student.id)}>
                  <View style={styles.studentSelectInfo}>
                    <View style={[
                      styles.checkbox,
                      student.selected && styles.checkboxSelected
                    ]}>
                      {student.selected && (
                        <Icon name="check" size={18} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.studentSelectName}>{student.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setStudentSelectModalVisible(false);
                  setSelectedClassForImport(null);
                  setSelectedStudents([]);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleConfirmImport}>
                <Text style={styles.addButtonText}>
                  Import ({selectedStudents.filter(s => s.selected).length})
                </Text>
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
  listContainer: {
    padding: 20,
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  textArea: {
    height: 120,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginBottom: 20,
    backgroundColor: COLORS.background,
  },
  importButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  importModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  classListContainer: {
    maxHeight: 400,
    marginBottom: 20,
  },
  classImportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  classImportInfo: {
    flex: 1,
  },
  classImportName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  classImportStudentCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  studentListContainer: {
    maxHeight: 350,
    marginBottom: 20,
  },
  studentSelectItem: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentSelectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  studentSelectName: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  singleCancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default HomeScreen;