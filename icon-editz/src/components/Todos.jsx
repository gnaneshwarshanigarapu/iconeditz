import { useState, useEffect } from 'react';

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true);
        // Todos are not part of the production API surface; keep this demo list local.
        const todos = []; const error = null;
        if (error) {
          console.error('Error fetching todos:', error);
        } else if (todos) {
          setTodos(todos);
        }
      } catch (error) {
        console.error('Error in getTodos:', error);
      } finally {
        setLoading(false);
      }
    }
    getTodos();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todos from Supabase</h1>
      <ul>
        {todos.length > 0 ? (
          todos.map((todo) => (
            <li key={todo.id} className="mb-2 p-2 border rounded">
              {/* Assuming your todo table has a 'name' or 'title' column */}
              {todo.name || todo.title}
            </li>
          ))
        ) : (
          <li>No todos found. Make sure you have a 'todos' table in Supabase with some data, and that anonymous users have read access.</li>
        )}
      </ul>
    </div>
  );
}
