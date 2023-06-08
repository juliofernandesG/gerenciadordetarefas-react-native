import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, StyleSheet } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Configurações do Firebase
const firebaseConfig = {
   apiKey: "AIzaSyAu0Spjh4Yk_l0eiDBX-wC3cnhNsLhZER8",
  authDomain: "crud-todo-list-9f575.firebaseapp.com",
  databaseURL: "https://crud-todo-list-9f575-default-rtdb.firebaseio.com",
  projectId: "crud-todo-list-9f575",
  storageBucket: "crud-todo-list-9f575.appspot.com",
  messagingSenderId: "806281545973",
  appId: "1:806281545973:web:be62c41c9f03563de81dbc",
  measurementId: "G-FP7FNMBVCK"
};

// Inicialize o Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default function App() {
  const [taskId, setTaskId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [taskList, setTaskList] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    const tasksRef = firebase.database().ref('tasks');
    tasksRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const taskArray = Object.keys(data).map((taskId) => ({
          id: taskId,
          ...data[taskId],
        }));
        const inProgressTasks = taskArray.filter(
          (task) => task.progress === 'In Progress'
        );
        const completedTasks = taskArray.filter(
          (task) => task.progress === 'Completed'
        );
        setTaskList(inProgressTasks);
        setCompletedTasks(completedTasks);
      } else {
        setTaskList([]);
        setCompletedTasks([]);
      }
    });
  };

  const addTask = () => {
    if (taskName && dueDate) {
      const tasksRef = firebase.database().ref('tasks');
      const newTaskRef = tasksRef.push();
      newTaskRef.set({
        taskName,
        dueDate: dueDate.toISOString(),
        startDate: startDate.toISOString(),
        progress: 'In Progress',
      });
      setTaskName('');
      setDueDate(new Date());
      setStartDate(new Date());
    }
  };

  const updateProgress = (taskId, progress) => {
    const taskRef = firebase.database().ref(`tasks/${taskId}`);
    taskRef.update({
      progress,
    });
  };

  const deleteTask = (taskId) => {
    const taskRef = firebase.database().ref(`tasks/${taskId}`);
    taskRef.remove();
  };

  const editTask = (taskId, taskName, dueDate, startDate) => {
    setTaskId(taskId);
    setTaskName(taskName);
    setDueDate(new Date(dueDate));
    setStartDate(new Date(startDate));
  };

  const updateTask = () => {
    if (taskName && dueDate) {
      const taskRef = firebase.database().ref(`tasks/${taskId}`);
      taskRef.update({
        taskName,
        dueDate: dueDate.toISOString(),
        startDate: startDate.toISOString(),
      });
      setTaskId('');
      setTaskName('');
      setDueDate(new Date());
      setStartDate(new Date());
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome da tarefa"
          value={taskName}
          onChangeText={(text) => setTaskName(text)}
        />
        <Text>Data de Início:</Text>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          className="datepicker"
        />
        <Text>Data de Término:</Text>
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          dateFormat="dd/MM/yyyy"
          className="datepicker"
        />
        {!taskId ? (
          <Button title="Adicionar Tarefa" onPress={addTask} />
        ) : (
          <View style={styles.editButtons}>
            <Button title="Atualizar" onPress={updateTask} />
            <Button
              title="Cancelar"
              onPress={() => {
                setTaskId('');
                setTaskName('');
                setDueDate(new Date());
                setStartDate(new Date());
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.taskListContainer}>
        <Text style={styles.listTitle}>Tarefas em Progresso</Text>
        {taskList.length > 0 ? (
          taskList.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskContainer,
                task.progress === 'In Progress' && styles.inProgressTask,
              ]}
            >
              <Text style={styles.taskName}>{task.taskName}</Text>
              <Text style={styles.dateLabel}>Data de Início: {task.startDate}</Text>
              <Text style={styles.dateLabel}>Data de Término: {task.dueDate}</Text>
              <View style={styles.progressButtons}>
                <Button
                  title="Em Progresso"
                  onPress={() => updateProgress(task.id, 'In Progress')}
                />
                <Button
                  title="Concluída"
                  onPress={() => updateProgress(task.id, 'Completed')}
                />
              </View>
              <Button
                title="Editar"
                onPress={() => editTask(task.id, task.taskName, task.dueDate, task.startDate)}
              />
              <Button title="Excluir" onPress={() => deleteTask(task.id)} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhuma tarefa em progresso encontrada.</Text>
        )}

        <Text style={styles.listTitle}>Atividades Concluídas</Text>
        {completedTasks.length > 0 ? (
          completedTasks.map((task) => (
            <View key={task.id} style={styles.taskContainer}>
              <Text style={styles.taskName}>{task.taskName}</Text>
              <Text style={styles.dateLabel}>Data de Início: {task.startDate}</Text>
              <Text style={styles.dateLabel}>Data de Término: {task.dueDate}</Text>
              <Button title="Excluir" onPress={() => deleteTask(task.id)} />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhuma tarefa concluída encontrada.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'white',
    width: '100%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  taskListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'gray',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
  },
  inProgressTask: {
    backgroundColor: '#F2CB1F',
    borderColor: '#F2CB1F',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
    marginTop: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskName: {
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 14,
    color: 'gray',
    textAlign: 'left',
  },
  dateLabel: {
    marginRight: 10,
    fontWeight: 'bold',
    fontSize: 14,
    color: 'gray',
    textAlign: 'right',
    marginBottom: 5,
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10,
  },
  progressButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'gray',
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
});
