import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { API_URL } from "@/constants/api";
import { createSession } from "@/lib/auth";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const validateForm = () => {
    if (!username) {
      setError("Username é obrigatório!");
      return false;
    } else if (!password) {
      setError("Palavra-passe é obrigatória!");
      return false;
    } else if (password.length < 8) {
      setError("Palavra-passe deve ter pelo menos 8 caracteres!");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setError(responseData.message || "Credenciais inválidas. Por favor, tente novamente.");
        } else if (response.status === 422) {
          const errorMessage = `Erro no campo ${responseData.detail[0].loc[1]}: ${responseData.detail[0].msg}`;
          setError(errorMessage || "Erro ao fazer login. Verifique suas credenciais.");
        }
        console.error("Login error:", responseData);
        return;
      }

      // Store token and create session
      createSession(responseData.access_token);
      navigate("/chat");
    } catch (_error) {
      setError("Erro ao conectar ao servidor. Tente novamente mais tarde.");
      console.error("Login error:", _error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center justify-center w-18 h-18 bg-white rounded-full mb-4 shadow-lg"> */}
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 shadow-lg">
              {/* <img src="/robot.png" alt="Logo" className="w-12 h-12 absolute" /> */}
              <img src="/onepieceloki.jpg" alt="Logo" className="w-24 h-24 absolute rounded-full" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo</h1>
            <p className="text-zinc-400">Entre com sua conta para continuar</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-zinc-200">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="Seu username"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-200">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                {/* <label className="flex items-center text-zinc-400">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-white bg-zinc-800 border-zinc-600 rounded focus:ring-white/50 focus:ring-2"
                  />
                  <span className="ml-2">Lembrar-me</span>
                </label> */}
                {/* <a href="#" className="text-zinc-300 hover:text-white transition-colors">
                  Esqueceu a senha?
                </a> */}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>{" "}
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-zinc-700"></div>
            <span className="px-4 text-zinc-500 text-sm">ou</span>
            <div className="flex-1 border-t border-zinc-700"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              title="Em breve"
              disabled
              //   className="w-full py-3 px-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
              className="w-full py-3 px-4 bg-zinc-800/50 border border-zinc-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              {/* <img src="https://github.com/eriveltosilva.png" alt="Google" className="w-5 h-5 mr-3 rounded-full" /> */}
              Continuar com Google
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-zinc-400">
            Não tem uma conta?{" "}
            <Link to="/criar-conta" className="text-white hover:text-zinc-300 font-medium transition-colors">
              Criar conta
            </Link>
          </p>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};
