const express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = 
        require("passport-local-mongoose")
const User = require("./model/User");
const Admin = require("./model/Admin");
const Pelicula = require("./model/Pelicula");
let app = express();
 
mongoose.connect("mongodb://localhost:27017/PrograPro");
 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));
 
app.use(passport.initialize());
app.use(passport.session());
 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());
 
//=====================
// ROUTES
//=====================
 
// muestra pagina. de inicio
app.get("/", function (req, res) {
    res.render("home");
});

//-----------------------User---------------------
// muestra el registro de Usuario
app.get("/register", function (req, res) {
    res.render("register");
});
 
// Manda a crear el usuario
app.post("/register", async (req, res) => {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password
    });
   
    return res.status(200).json(user);
  });

//Muestra el inicio de secion
app.get("/login", function (req, res) {
    res.render("login");
});
 
//Llama al Usuario
app.post("/login", async function(req, res){
    try {
        // checa si el usuario existe
        const user = await User.findOne({ username: req.body.username });
        if (user) {
          //checa si la contraseña es correcta
          const result = req.body.password === user.password;
          if (result) {
            res.render("secret");
          } else {
            res.status(400).json({ error: "password doesn't match" });
          }
        } else {
          res.status(400).json({ error: "User doesn't exist" });
        }
      } catch (error) {
        res.status(400).json({ error });
      }
});
 
//-----------------------Admin---------------------
// muestra el registro de Admin
app.get("/register_adm", function (req, res) {
  res.render("register_adm");
});

//manda a registrar al admin
app.post("/register_adm", async (req, res) => {
  const admin = await Admin.create({
    adminame: req.body.adminame,
    pass_admin: req.body.pass_admin
  });
 
  return res.status(200).json(admin);
});
 
//Muestra inicio de secion Admin
app.get("/login_adm", function (req, res) {
  res.render("login_adm");
});

//manda a llamar al admin
app.post("/login_adm", async function(req, res){
  try {
      //checa si existe el admin
      const admin = await Admin.findOne({ adminame: req.body.adminame });
      if (admin) {
        //checa si la contraseña coinside
        const result = req.body.pass_admin === admin.pass_admin;
        if (result) {
          res.render("secret");
        } else {
          res.status(400).json({ error: "password doesn't match" });
        }
      } else {
        res.status(400).json({ error: "Admin doesn't exist" });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
});

//----------------------------------------------------
// muestra "pagina secreta" con listado de películas
app.get("/secret", async function (req, res) {
  try {
    let peliculas;
    const searchTerm = req.query.q; // Obtenemos el término de búsqueda de la URL
    if (searchTerm) {
        // Utilizamos una consulta de búsqueda más compleja para buscar en múltiples campos de la película
        peliculas = await Pelicula.find({
            $or: [
                { nombre: { $regex: searchTerm, $options: 'i' } }, // Busca en el nombre de la película
                /*{ director: { $regex: searchTerm, $options: 'i' } }, // Busca en el nombre del director
                { actores: { $regex: searchTerm, $options: 'i' } }, // Busca en el nombre de los actores
                { descripción: { $regex: searchTerm, $options: 'i' } } // Busca en la descripción de la película*/
            ]
        });
    } else {
        // Si no hay término de búsqueda, obtenemos todas las películas
        peliculas = await Pelicula.find({});
    }
    // Renderizamos la plantilla 'secret.ejs' y pasamos las películas y el término de búsqueda como contexto
    res.render("secret.ejs", { peliculas: peliculas, searchTerm: searchTerm });
  } catch (error) {
    console.error("Error al obtener el listado de películas:", error);
    // Maneja el error de alguna manera adecuada, como mostrar un mensaje de error en la página
    res.render("error", { message: "Error al obtener el listado de películas." });
  }
  });
 
 
//----------------------------------------------------
// Ruta para mostrar el formulario de agregar película
app.get("/agregar_peli", function (req, res) {
  res.render("agregar_peli");
});

// Ruta para manejar el envío del formulario de agregar película
app.post("/agregar_peli", async function (req, res) {
  try {
      // Obtén los datos del formulario
      const { nombre, año, director, actores, descripción, img } = req.body;
      
      // Crea una nueva instancia de Pelicula con los datos recibidos
      const nuevaPelicula = new Pelicula({
          nombre: nombre,
          año: año,
          director: director,
          actores: actores,
          descripción: descripción,
          img: img
      });

      // Guarda la nueva película en la base de datos
      await nuevaPelicula.save();

      // Redirige a la página principal o a cualquier otra página deseada
      res.redirect("/secret");
  } catch (error) {
      console.error("Error al agregar la película:", error);
      // Maneja el error de alguna manera adecuada, como mostrar un mensaje de error en la página
      res.render("error", { message: "Error al agregar la película." });
  }
});

//----------------------------------------------------
// Ruta para manejar el borrado de una película
app.post("/borrar_pelicula", async function(req, res) {
  try {
      // Obtén el ID de la película que se va a borrar desde los parámetros de la solicitud
      const peliculaId = req.body.peliculaId;

      // Busca la película por su ID y elimínala de la base de datos
      await Pelicula.findByIdAndRemove(peliculaId);

      // Redirige a la página principal u otra página deseada después de borrar la película
      res.redirect("/secret");
  } catch (error) {
      console.error("Error al borrar la película:", error);
      // Maneja el error de alguna manera adecuada, como mostrar un mensaje de error en la página
      res.render("error", { message: "Error al borrar la película." });
  }
});

//----------------------------------------------------

//salir de la secion 
app.get("/logout", function (req, res) {
  req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});
 
let port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});

