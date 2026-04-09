const { useState, useEffect } = React;

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/backlog")
      .then((res) => res.json())
      .then(setItems);
  }, []);

  return (
    <div>
      <h1>GeriCall Backlog</h1>
      <p>Backlog items: {items.length}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
