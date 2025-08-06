import { Route, Routes } from 'react-router'
import { AuthRoutes } from '../auth/routes/AuthRoutes'
import { MyAppRouter } from '../myApp/routes/MyAppRouter'

export const AppRouter = () => {
  return (
    <Routes >

        {/* Router de la sección Auth */}
        <Route path='/auth/*' element={<AuthRoutes/>} />

        {/* Router de la applicacion */}
        <Route path='/*' element={<MyAppRouter/>} />


    </Routes>
  )
}
