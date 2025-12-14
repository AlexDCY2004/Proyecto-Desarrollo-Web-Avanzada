import { Estudiante } from "../models/estudiante.js";
import { Curso } from "../models/curso.js";
import { Op } from "sequelize";

//crear estudiante
export const crearEstudiante = async (req, res) => {
    try{
        const {nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado,cursoId} = req.body;
        if(!nombre || !cedula){
            return res.status(400).json({mensaje: "Faltan datos requeridos"});
        }

        //validar que exista el cursoId si se proporciona
        if(cursoId){
            const cursoExistente = await Curso.findByPk(cursoId);
            if(!cursoExistente){
                return res.status(400).json({mensaje: "Curso no encontrado"});
            }
        }

        const nuevo = await Estudiante.create({nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado, cursoId});
        res.status(201).json(nuevo);
    
    }catch (err){
        res.status(500).json({error: err.message});
    }
};

//crear obtener todos los estudiante

// En listarEstudiantes
export const listarEstudiantes = async (req, res) => {
    try{
        const estudiantes = await Estudiante.findAll({
            where: { estado: 'activo' },
            include: [{
                model: Curso,
                attributes: ['id', 'nombre', 'nivel', 'paralelo']
            }]
        });
        res.json(estudiantes);
    } catch (error){
        res.status(500).json({mensaje: "Error al listar los estudiantes", error: error.message});
    }
};

// En buscarEstudianteId
export const buscarEstudianteId = async (req, res) => {
    try{
        const estudiante = await Estudiante.findByPk(req.params.id, {
            include: [{
                model: Curso
            }]
        });
        if(!estudiante){
            return res.status(404).json({mensaje: "Estudiante no encontrado"});
        }
        res.json(estudiante);
    } catch (error){
        res.status(500).json({mensaje: "Error al buscar el estudiante", error: error.message});
    }
};

export const buscarEstudiante = async (req, res) => {
    try{
        const { busqueda } = req.query;
        
        if(!busqueda){
            return res.status(400).json({mensaje: "Debe proporcionar un término de búsqueda"});
        }

        const estudiantes = await Estudiante.findAll({
            where: {
                [Op.or]: [
                    { cedula: { [Op.like]: `%${busqueda}%` } },
                    { nombre: { [Op.like]: `%${busqueda}%` } },
                    { id: isNaN(busqueda) ? null : busqueda }
                ],
                estado: 'activo'
            }
        });

        if(estudiantes.length === 0){
            return res.status(404).json({mensaje: "No se encontraron estudiantes con ese criterio"});
        }

        res.json(estudiantes);

    } catch (error){
        res.status(500).json({mensaje: "Error al buscar estudiantes", error: error.message});
    }
};

//buscar por cédula específica
export const buscarEstudiantePorCedula = async (req, res) => {
    try{
        const estudiante = await Estudiante.findOne({ where: { cedula: req.params.cedula } });
        if(!estudiante){
            return res.status(404).json({mensaje: "Estudiante no encontrado"});
        }

        res.json(estudiante);

    } catch (error){
        res.status(500).json({mensaje: "Error al buscar el estudiante", error: error.message});
    }
};

//buscar por nombre
export const buscarEstudiantePorNombre = async (req, res) => {
    try{
        const estudiantes = await Estudiante.findAll({ 
            where: { 
                nombre: { [Op.like]: `%${req.params.nombre}%` }
            } 
        });
        
        if(estudiantes.length === 0){
            return res.status(404).json({mensaje: "No se encontraron estudiantes con ese nombre"});
        }

        res.json(estudiantes);

    } catch (error){
        res.status(500).json({mensaje: "Error al buscar estudiantes", error: error.message});
    }
};

//actualizar

export const actualizarEstudiante = async (req, res) => {
    try{
        const estudiante = await Estudiante.findByPk(req.params.id);
        if(!estudiante)
            return res.status(404).json({mensaje: "Estudiante no encontrado para actualizar"});

        const { nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado,cursoId } = req.body;
        if (!nombre && !cedula && !email && !telefono && !direccion && !fechaNacimiento && !foto && !estado && !cursoId) {
            return res.status(400).json({ message: "No hay campos válidos para actualizar" });
        }

        await estudiante.update({ nombre, cedula, email, telefono, direccion, fechaNacimiento, foto, estado, cursoId });

        res.json(estudiante);

    } catch (error){
        res.status(500).json({mensaje: "Error al actualizar el estudiante", error: error.message});
    }
};

//eliminar

export const eliminarEstudiante = async (req, res) => {
    try{
        const estudiante = await Estudiante.findByPk(req.params.id);
        if(!estudiante)
            return res.status(404).json({mensaje: "Estudiante no encontrado para eliminar"});

        await estudiante.destroy();
        res.json({mensaje: "Estudiante eliminado correctamente"});

    } catch (error){
        res.status(500).json({mensaje: "Error al eliminar el estudiante", error: error.message});
    }
};



