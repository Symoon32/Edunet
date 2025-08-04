from flask import Blueprint, render_template

estudiantes_bp = Blueprint('estudiantes', __name__, url_prefix='/estudiantes')

@estudiantes_bp.route('/inicio')
def inicio():
    return render_template('estudiantes/pagina_principal.html', active_page='inicio')

@estudiantes_bp.route('/perfil')
def perfil():
    return render_template('estudiantes/perfil.html', active_page='perfil')

@estudiantes_bp.route('/historial')
def historial():
    return render_template('estudiantes/historial.html', active_page='historial')

@estudiantes_bp.route('/materiales')
def materiales():
    return render_template('estudiantes/materiales.html', active_page='materiales')

@estudiantes_bp.route('/tareas')
def tareas():
    return render_template('estudiantes/tareas.html', active_page='tareas')

@estudiantes_bp.route('/calendario')
def calendario():
    return render_template('estudiantes/calendario.html', active_page='calendario')
