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