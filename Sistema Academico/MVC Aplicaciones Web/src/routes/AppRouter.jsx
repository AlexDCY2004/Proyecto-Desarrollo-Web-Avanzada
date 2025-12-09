import {Routes, Route, BrowserRouter} from 'react-router-dom';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Productos from '../pages/Productos.jsx';
import Usuarios from '../pages/Usuarios.jsx';
import Navbar from '../components/Navbar.jsx';

export default function AppRouter(){
    return(
        <BrowserRouter>
            <Navbar>
                
            </Navbar>
            <Routes>
                <Route path='/' element={<Home/>}></Route>
                <Route path='/login' element={<Login/>}></Route>
                <Route path='/productos' element={<Productos/>}></Route>
                <Route path='/usuarios' element={<Usuarios/>}></Route>
            </Routes>
        </BrowserRouter>
    );
        
}