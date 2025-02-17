import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
    <div style={{ height: "100vh", width: "100vw", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <App />
    </div>
);
