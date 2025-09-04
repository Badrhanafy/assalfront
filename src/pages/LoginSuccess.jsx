// src/pages/LoginSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function LoginSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/"); // رجعو للـ home أو dashboard
    }
  }, [params, navigate]);

  return <p>Signing you in...</p>;
}

export default LoginSuccess;
