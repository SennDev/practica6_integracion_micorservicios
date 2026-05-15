import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();

const PORT = Number(process.env.PORT ?? 3001);
const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'educursos',
  password: process.env.DB_PASSWORD ?? 'educursos123',
  database: process.env.DB_NAME ?? 'courses_db',
});

const seedCourses = [
  {
    nombre: 'Fundamentos de HTML y CSS',
    descripcion:
      'Aprende a construir interfaces web responsivas desde cero con HTML5, CSS3, Flexbox y Grid.',
    categoria: 'Frontend',
    nivel: 'Basico',
    duracion: '30 horas',
    modalidad: 'Online',
    imagenUrl: '/images/curso-defecto.jpg',
    temario: [
      {
        titulo: 'Modulo 1: Estructura web',
        descripcion: 'Semantica HTML, formularios y accesibilidad inicial.',
      },
      {
        titulo: 'Modulo 2: Diseno visual',
        descripcion: 'Selectores, box model, Flexbox y Grid.',
      },
    ],
  },
  {
    nombre: 'Introduccion a JavaScript',
    descripcion:
      'Domina variables, funciones, arreglos, asincronia y manipulacion del DOM para crear experiencias interactivas.',
    categoria: 'Frontend',
    nivel: 'Intermedio',
    duracion: '40 horas',
    modalidad: 'Online',
    imagenUrl: '/images/curso-defecto.jpg',
    temario: [
      {
        titulo: 'Modulo 1: Logica de programacion',
        descripcion: 'Variables, condicionales, ciclos y funciones.',
      },
      {
        titulo: 'Modulo 2: JavaScript en el navegador',
        descripcion: 'Eventos, DOM y consumo basico de APIs.',
      },
    ],
  },
  {
    nombre: 'APIs con Node.js y Express',
    descripcion:
      'Construye servicios REST, conecta bases de datos y aplica buenas practicas para backend moderno.',
    categoria: 'Backend',
    nivel: 'Intermedio',
    duracion: '45 horas',
    modalidad: 'Online',
    imagenUrl: '/images/curso-defecto.jpg',
    temario: [
      {
        titulo: 'Modulo 1: Servidores y rutas',
        descripcion: 'Express, middlewares, validacion y manejo de errores.',
      },
      {
        titulo: 'Modulo 2: Persistencia',
        descripcion: 'Conexion a PostgreSQL y modelado de datos.',
      },
    ],
  },
  {
    nombre: 'Bases de Datos con PostgreSQL',
    descripcion:
      'Modela informacion academica, escribe consultas SQL y optimiza operaciones CRUD con PostgreSQL.',
    categoria: 'Backend',
    nivel: 'Basico',
    duracion: '35 horas',
    modalidad: 'Presencial',
    imagenUrl: '/images/curso-defecto.jpg',
    temario: [
      {
        titulo: 'Modulo 1: Modelado relacional',
        descripcion: 'Entidades, relaciones, llaves y normalizacion.',
      },
      {
        titulo: 'Modulo 2: SQL practico',
        descripcion: 'Consultas, filtros, joins y agregaciones.',
      },
    ],
  },
  {
    nombre: 'Diseno UX/UI para productos educativos',
    descripcion:
      'Disena experiencias de aprendizaje intuitivas con investigacion, wireframes y prototipos funcionales.',
    categoria: 'UX/UI',
    nivel: 'Intermedio',
    duracion: '32 horas',
    modalidad: 'Online',
    imagenUrl: '/images/curso-defecto.jpg',
    temario: [
      {
        titulo: 'Modulo 1: Investigacion con usuarios',
        descripcion: 'Personas, journey maps y deteccion de problemas.',
      },
      {
        titulo: 'Modulo 2: Prototipado',
        descripcion: 'Flujos, wireframes y pruebas de usabilidad.',
      },
    ],
  },
  {
    nombre: 'Angular para plataformas escalables',
    descripcion:
      'Desarrolla aplicaciones modulares con Angular, componentes standalone, formularios y consumo de APIs.',
    categoria: 'Frontend',
    nivel: 'Avanzado',
    duracion: '50 horas',
    modalidad: 'Presencial',
    imagenUrl: '/images/curso-defecto.jpg',
    temario: [
      {
        titulo: 'Modulo 1: Arquitectura Angular',
        descripcion: 'Standalone components, rutas y servicios.',
      },
      {
        titulo: 'Modulo 2: Integracion',
        descripcion: 'HttpClient, estados de UI y despliegue.',
      },
    ],
  },
];

app.use(cors());
app.use(express.json());

async function waitForDatabase(action, retries = 15, delayMs = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      console.warn(`courses-service: reintentando conexion a BD (${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

async function initializeDatabase() {
  await waitForDatabase(async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL UNIQUE,
        descripcion TEXT NOT NULL,
        categoria VARCHAR(80) NOT NULL,
        nivel VARCHAR(50) NOT NULL,
        duracion VARCHAR(50) NOT NULL,
        modalidad VARCHAR(50) NOT NULL,
        imagen_url TEXT NOT NULL DEFAULT '/images/curso-defecto.jpg',
        temario JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const {
      rows: [counter],
    } = await pool.query('SELECT COUNT(*)::int AS total FROM courses');

    if (counter.total === 0) {
      for (const curso of seedCourses) {
        await pool.query(
          `
            INSERT INTO courses (
              nombre,
              descripcion,
              categoria,
              nivel,
              duracion,
              modalidad,
              imagen_url,
              temario
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
          `,
          [
            curso.nombre,
            curso.descripcion,
            curso.categoria,
            curso.nivel,
            curso.duracion,
            curso.modalidad,
            curso.imagenUrl,
            JSON.stringify(curso.temario),
          ],
        );
      }
    }
  });
}

function normalizeCourse(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    categoria: row.categoria,
    nivel: row.nivel,
    duracion: row.duracion,
    modalidad: row.modalidad,
    imagenUrl: row.imagenUrl,
    temario: Array.isArray(row.temario) ? row.temario : [],
  };
}

function validateCoursePayload(payload) {
  const requiredFields = ['nombre', 'descripcion', 'categoria', 'nivel', 'duracion', 'modalidad'];
  const missingFields = requiredFields.filter((field) => !payload[field]?.toString().trim());

  if (missingFields.length > 0) {
    return `Faltan campos obligatorios: ${missingFields.join(', ')}`;
  }

  return null;
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'courses-service' });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'courses-service', details: error.message });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const search = req.query.search?.toString().trim();
    const category = req.query.category?.toString().trim();
    const filters = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      const searchIndex = values.length;
      filters.push(`(nombre ILIKE $${searchIndex} OR descripcion ILIKE $${searchIndex})`);
    }

    if (category) {
      values.push(category);
      filters.push(`categoria = $${values.length}`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `
        SELECT
          id,
          nombre,
          descripcion,
          categoria,
          nivel,
          duracion,
          modalidad,
          imagen_url AS "imagenUrl",
          temario
        FROM courses
        ${whereClause}
        ORDER BY nombre ASC
      `,
      values,
    );

    res.json(rows.map(normalizeCourse));
  } catch (error) {
    res.status(500).json({ message: 'No fue posible consultar el catalogo.', details: error.message });
  }
});

app.get('/api/courses/categories', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT DISTINCT categoria FROM courses ORDER BY categoria ASC');
    res.json(rows.map((row) => row.categoria));
  } catch (error) {
    res.status(500).json({ message: 'No fue posible consultar las categorias.', details: error.message });
  }
});

app.get('/api/courses/by-name/:nombre', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT
          id,
          nombre,
          descripcion,
          categoria,
          nivel,
          duracion,
          modalidad,
          imagen_url AS "imagenUrl",
          temario
        FROM courses
        WHERE nombre ILIKE $1
        ORDER BY nombre ASC
      `,
      [`%${req.params.nombre}%`],
    );

    res.json(rows.map(normalizeCourse));
  } catch (error) {
    res.status(500).json({ message: 'No fue posible consultar el curso por nombre.', details: error.message });
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
        SELECT
          id,
          nombre,
          descripcion,
          categoria,
          nivel,
          duracion,
          modalidad,
          imagen_url AS "imagenUrl",
          temario
        FROM courses
        WHERE id = $1
      `,
      [Number(req.params.id)],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    return res.json(normalizeCourse(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: 'No fue posible consultar el curso.', details: error.message });
  }
});

app.post('/api/courses', async (req, res) => {
  const validationError = validateCoursePayload(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const {
      nombre,
      descripcion,
      categoria,
      nivel,
      duracion,
      modalidad,
      imagenUrl = '/images/curso-defecto.jpg',
      temario = [],
    } = req.body;

    const { rows } = await pool.query(
      `
        INSERT INTO courses (
          nombre,
          descripcion,
          categoria,
          nivel,
          duracion,
          modalidad,
          imagen_url,
          temario
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        RETURNING
          id,
          nombre,
          descripcion,
          categoria,
          nivel,
          duracion,
          modalidad,
          imagen_url AS "imagenUrl",
          temario
      `,
      [nombre, descripcion, categoria, nivel, duracion, modalidad, imagenUrl, JSON.stringify(temario)],
    );

    return res.status(201).json(normalizeCourse(rows[0]));
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un curso con ese nombre.' });
    }

    return res.status(500).json({ message: 'No fue posible registrar el curso.', details: error.message });
  }
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`courses-service escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No fue posible inicializar courses-service', error);
    process.exit(1);
  });
