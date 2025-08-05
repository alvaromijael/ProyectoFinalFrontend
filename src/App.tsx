import { AuthProvider } from "./auth/context/AuthContext"
import { AppRouter } from "./router/AppRouter"
import './index.css'
export const App = () => {
  return (
    <AuthProvider>
        <AppRouter/>
    </AuthProvider>
  )
}
