from flask import Flask, render_template, request, redirect, session, url_for
app = Flask(__name__)
app.secret_key = 'clave_secreta'


def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',          
        password='12345',     
        database='Edunet-BaseDatos'  
    )


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        correo = request.form['usuario']
        contraseña = request.form['contraseña']
        rol = request.form['rol']

        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            if rol == 'Estudiante':
                cursor.execute("SELECT * FROM Estudiante WHERE correo = %s", (correo,))
            elif rol == 'Profesor':
                cursor.execute("SELECT * FROM Profesor WHERE correoProfesor = %s", (correo,))
            elif rol == 'Acudiente':
                cursor.execute("SELECT * FROM Acudiente WHERE correoAcudiente = %s", (correo,))
            elif rol == 'Directivo':
                cursor.execute("SELECT * FROM Directivo WHERE correo = %s", (correo,))
            else:
                return "Rol inválido"

            usuario = cursor.fetchone()

            if usuario:
               
                session['usuario'] = correo
                session['rol'] = rol
                return redirect(url_for(f'pantalla_{rol.lower()}'))  
            else:
                return render_template('login.html', error="Credenciales incorrectas")

        finally:
            if conn.is_connected():
                cursor.close()
                conn.close()
    else:
        return render_template('login.html')
    
@app.route('/estudiante')
def pantalla_estudiante():
    if session.get('rol') == 'Estudiante':
        return f"Bienvenido estudiante: {session.get('usuario')}"
    return redirect(url_for('login'))

@app.route('/profesor')
def pantalla_profesor():
    if session.get('rol') == 'Profesor':
        return f"Bienvenido profesor: {session.get('usuario')}"
    return redirect(url_for('login'))

@app.route('/acudiente')
def pantalla_acudiente():
    if session.get('rol') == 'Acudiente':
        return f"Bienvenido acudiente: {session.get('usuario')}"
    return redirect(url_for('login'))

@app.route('/directivo')
def pantalla_directivo():
    if session.get('rol') == 'Directivo':
        return f"Bienvenido directivo: {session.get('usuario')}"
    return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
def home():
    return redirect(url_for('login'))


@app.route('/prueba_db')
def prueba_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")
        base = cursor.fetchone()
        return f"Conectado a la base de datos: {base[0]}"
    except mysql.connector.Error as err:
        return f"Error: {err}"
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def validar_usuario(rol, correo, contraseña):
    try:
        conexion = get_db_connection()
        cursor = conexion.cursor(dictionary=True)

        query = f"SELECT * FROM {rol} WHERE correo = %s AND contraseña = %s"
        cursor.execute(query, (correo, contraseña))
        usuario = cursor.fetchone()

        return usuario  # None si no existe

    except mysql.connector.Error as err:
        print(f"Error de validación: {err}")
        return None

    finally:
        if conexion.is_connected():
            cursor.close()
            conexion.close()

def registrar_usuario(rol, nombre, apellido, correo, contraseña):
    try:
        conexion = get_db_connection()
        cursor = conexion.cursor()

        query = f"""
            INSERT INTO {rol} (nombre{rol}, apellido{rol}, correo, contraseña)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (nombre, apellido, correo, contraseña))
        conexion.commit()
        return True

    except mysql.connector.Error as err:
        print(f"❌ Error al registrar usuario: {err}")
        return False

    finally:
        if conexion.is_connected():
            cursor.close()
            conexion.close()
