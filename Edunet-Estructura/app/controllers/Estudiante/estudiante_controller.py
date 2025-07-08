from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from app.db import get_db  # Asegúrate de tener una función para obtener la conexión a la DB
from werkzeug.security import check_password_hash

estudiantes_bp = Blueprint('estudiantes', __name__)

@estudiantes_bp.route('/app/templates/inicio de sesion.html', methods=['GET', 'POST'])
def login_estudiante():
    if request.method == 'POST':
        correo = request.form['correo']
        contraseña = request.form['contraseña']

        db = get_db()
        estudiante = db.execute('SELECT * FROM estudiantes WHERE correo = %s', (correo,)).fetchone()

        if estudiante and check_password_hash(estudiante['contraseña'], contraseña):
            session['usuario_id'] = estudiante['id']
            session['tipo_usuario'] = 'estudiante'
            session['nombre'] = estudiante['nombre']
            return redirect(url_for('/app/templates/html estudiantes/paginaprincipal.html'))
        else:
            flash('Credenciales incorrectas')
    return render_template('/app/templates/inicio de sesion.html')

@estudiantes_bp.route('/app/templates/html estudiantes/paginaprincipal.html')
def dashboard():
    if 'usuario_id' not in session or session.get('tipo_usuario') != 'estudiante':
        return redirect(url_for('estudiantes.login_estudiante'))
    return render_template('estudiantes/dashboard.html', nombre=session.get('nombre'))

@estudiantes_bp.route('/app/templates/html estudiantes/perfilbootstrap.html')
def perfil():
    db = get_db()
    estudiante = db.execute('SELECT * FROM estudiantes WHERE id = %s', (session['usuario_id'],)).fetchone()
    return render_template('estudiantes/perfil.html', estudiante=estudiante)

@estudiantes_bp.route('/app/templates/html estudiantes/historialbootstrap.html')
def historial():
    db = get_db()
    historial = db.execute('SELECT * FROM historial_academico WHERE estudiante_id = %s', (session['usuario_id'],)).fetchall()
    return render_template('estudiantes/historial.html', historial=historial)

@estudiantes_bp.route('/app/templates/html estudiantes/materialesbootstrap.html')
def materiales():
    db = get_db()
    materiales = db.execute('SELECT * FROM materiales WHERE curso_id IN (SELECT curso_id FROM inscripciones WHERE estudiante_id = %s)', (session['usuario_id'],)).fetchall()
    return render_template('estudiantes/materiales.html', materiales=materiales)

@estudiantes_bp.route('/app/templates/html estudiantes/verificarbootstrap.html')
def tareas():
    db = get_db()
    tareas = db.execute('SELECT * FROM tareas WHERE estudiante_id = %s', (session['usuario_id'],)).fetchall()
    return render_template('estudiantes/tareas.html', tareas=tareas)


@estudiantes_bp.route('/app/templates/html estudiantes/calendariobootstrap.html')
def calendario():
    db = get_db()
    eventos = db.execute('SELECT * FROM calendario WHERE publico = "estudiantes" OR publico = "todos"').fetchall()
    return render_template('estudiantes/calendario.html', eventos=eventos)
