import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const handleLogin = () => {
        if (email.trim() === "") return;
        // ejemplo: navegar a la ruta principal tras el login
        navigate("/");
    }

    return (
        <div>
            <h1>Login</h1>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={handleLogin}>Ingresar</button>
        </div>
    );
}