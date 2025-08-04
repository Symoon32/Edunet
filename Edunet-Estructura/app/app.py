from flask import Flask, render_template, request, redirect, url_for
import pymysql
import bcrypt
import os 
from dotenv import load_dotenv

from app.controllers.Estudiante.estudiantes_controller import estudiantes_bp

load_dotenv()

app = Flask(__name__)
app.register_blueprint(estudiantes_bp)

def connect_db():
    try:
        connection = pymysql.connect(host=os.getenv("DB_HOST"),
                                     user=os.getenv("DB_USER"),
                                     password=os.getenv("DB_PASSWORD"),
                                     database=os.getenv("DB_NAME"))
        return connection
    except pymysql.MySQLError as e:
        print(f"Error connecting to the database: {e}")
        return None

@app.route('/')
def index():
    
    return redirect('/login')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['nombres']
        surname = request.form['apellidos']
        email = request.form['correo']
        document = request.form['documento']
        telephone = request.form['telefono']
        address = request.form['direccion']
        password = request.form['contrasena'] 
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        grado = request.form.get('grado')  
        emergency_contact = request.form.get('contacto_emergencia') 
        emergency_phone = request.form.get('telefono_contacto_emergencia')
        asigned_course = request.form.get('curso_asignado')
        student_incharge = request.form.get('estudiante_relacionado')
        relationship = request.form.get('parentesco')
        admin_charge = request.form.get('cargo')
        role = request.form['rol']

        connection = connect_db()
            
        if connection:
            try:
                with connection.cursor() as cursor:
                    sql = "INSERT INTO usuarios (nombres, apellidos, correo, documento, telefono, direccion, password, grado, contacto_emergencia, telefono_contacto_emergencia, curso_asignado, nombre_estudiante_acargo, parentezco, cargo_admin, idRol) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(sql, (name, surname, email, document, telephone, address, hashed_password, grado, emergency_contact, emergency_phone, asigned_course, student_incharge, relationship, admin_charge, role))
                connection.commit()
            except pymysql.MySQLError as e:
                print(f"Error inserting data: {e}")
            finally:
                connection.close()

    return render_template('admin/crear_usuario.html')

@app.route('/main')
def main():
    return redirect(url_for('register'))  # Cambia a la ruta que desees como inicio


@app.route('/principal')
def principal():
    return render_template('admin/principal.html')  

@app.route('/gestion_usuarios')
def gestion_usuarios():
    return render_template('admin/gestion_usuarios.html')

@app.route('/configurar_cursos')
def configurar_cursos():
    return render_template('admin/configurar_cursos.html')


@app.route('/reportes')
def reportes():
    return render_template('admin/reportes.html')

@app.route('/informes')
def informes():
    return render_template('admin/informes.html')

@app.route('/comunicacion_general')
def comunicacion_general():
    return render_template('admin/comunicacion_general.html')

@app.route('/anuncios_boletines')
def anuncios_boletines():
    return render_template('admin/anuncios_boletines.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['usuario']
        password = request.form['password']

        connection = connect_db()
        if connection:
            try:
                with connection.cursor() as cursor:
                    sql = "SELECT * FROM usuarios WHERE correo = %s"
                    cursor.execute(sql, (email,))
                    user = cursor.fetchone()

                    if user and bcrypt.checkpw(password.encode('utf-8'), user[7].encode('utf-8')):
                        if user[15] == 1:
                            return redirect('/estudiantes/inicio')
                        elif user[15] == 4:
                            return redirect('/principal')
                        else:
                            return render_template('inicio de sesion.html', error='Rol no reconocido')
                    else:
                        return render_template('inicio de sesion.html', error='Credenciales inválidas')
            except pymysql.MySQLError as e:
                print(f"Error querying database: {e}")
            finally:
                connection.close()

    return render_template('inicio de sesion.html')

if __name__ == '__main__':
    app.run(debug=True)
