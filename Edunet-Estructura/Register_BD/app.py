from flask import Flask, render_template, request, redirect, url_for

import pymysql

import bcrypt
import os 
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

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
    # return render_template('crear_usuario.html')
    return redirect('/main')

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

        # return redirect(url_for('./templates/crear_usuario.html'))

    return render_template('crear_usuario.html')

@app.route('/main')
def main():
    return render_template('inicio_creador.html')

if __name__ == '__main__':
    app.run(debug=True) 