import { Editor } from "@monaco-editor/react";
import "./App.css";
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState, useEffect } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);
  const [username, setUsername] = useState(()=> {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  const [users, setUsers] = useState([]);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  const handleJoin = (e) => {

    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({}, "","?username=" + e.target.username.value)
  };

  useEffect(()=> {
    if( username && editorRef.current){
      const provider = new SocketIOProvider(
        "http://localhost:3000",
        "monaco",
        ydoc,
        {
          autoConnect: true,
        },
      );
      provider.awareness.setLocalStateField("user", {username})
      provider.awareness.on("change", () => { 
         const states = Array.from(provider.awareness.getStates().values())
         setUsers(states.map(state => state.user).filter(user => Boolean(user.username)))
       })

      new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness,
      );
    }
  }, [editorRef.current, username])

  console.log(users);

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form className="flex flex-col gap-4" onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside classname="h-full w-1/4 bg-amber-50 rounded-lg"></aside>
      <section className="w-3/4 bg-neutral-800 rounded-lg  overflow-hidden">
        <Editor
          height="100%"
          language="javascript"
          defaultValue="//some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;
